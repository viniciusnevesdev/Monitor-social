import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Diretório para armazenamento local do cofre de sincronização em nuvem
const DATA_DIR = path.resolve('data');
const SYNC_FILE = path.join(DATA_DIR, 'cloud_vault.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readCloudVault(): Record<string, { contacts: any[]; updatedAt: string }> {
  try {
    if (fs.existsSync(SYNC_FILE)) {
      const content = fs.readFileSync(SYNC_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Erro ao ler cofre de nuvem:', err);
  }
  return {};
}

function writeCloudVault(vault: Record<string, { contacts: any[]; updatedAt: string }>) {
  try {
    fs.writeFileSync(SYNC_FILE, JSON.stringify(vault, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro ao gravar no cofre de nuvem:', err);
  }
}

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// 2. Buscar dados da nuvem pelo código de sincronização
app.get('/api/sync/:syncKey', (req, res) => {
  const syncKey = (req.params.syncKey || '').toUpperCase().trim();
  if (!syncKey) {
    return res.status(400).json({ error: 'Código de sincronização obrigatório' });
  }

  const vault = readCloudVault();
  const roomData = vault[syncKey];

  if (!roomData) {
    return res.status(404).json({ error: 'Nenhum dado encontrado para este código.' });
  }

  return res.json({
    syncKey,
    contacts: roomData.contacts,
    updatedAt: roomData.updatedAt,
  });
});

// 3. Salvar / Atualizar dados na nuvem para um código de sincronização
app.post('/api/sync/:syncKey', (req, res) => {
  const syncKey = (req.params.syncKey || '').toUpperCase().trim();
  const { contacts } = req.body;

  if (!syncKey) {
    return res.status(400).json({ error: 'Código de sincronização obrigatório' });
  }

  if (!Array.isArray(contacts)) {
    return res.status(400).json({ error: 'Formato de contatos inválido (array esperado)' });
  }

  const vault = readCloudVault();
  vault[syncKey] = {
    contacts,
    updatedAt: new Date().toISOString(),
  };

  writeCloudVault(vault);

  return res.json({
    success: true,
    syncKey,
    contactCount: contacts.length,
    updatedAt: vault[syncKey].updatedAt,
  });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

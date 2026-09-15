import express, { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const APP_VERSION = '1.4.5';
const PORT = Number(process.env.PORT) || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production' || Boolean(process.env.RAILWAY_ENVIRONMENT_NAME);

app.use(express.json({ limit: '25mb' }));

// Diretório para armazenamento local do cofre de sincronização em nuvem
const DATA_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH
  ? path.resolve(process.env.RAILWAY_VOLUME_MOUNT_PATH)
  : path.resolve('data');
const SYNC_FILE = path.join(DATA_DIR, 'cloud_vault.json');
const ICON_OVERRIDES_FILE = path.join(DATA_DIR, 'icon_overrides.json');
const ICON_BACKUP_DIR = path.join(DATA_DIR, 'icon-backups');
const ICON_FINAL_BACKUP_FILE = path.join(ICON_BACKUP_DIR, 'icon_overrides-v1.2.0-final.json');
const ICON_EDITOR_KEY = process.env.ICON_EDITOR_KEY || '';

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function ensureFinalIconBackup() {
  try {
    if (!fs.existsSync(ICON_OVERRIDES_FILE)) {
      console.warn('Backup de ícones não criado: configuração global ainda não existe.');
      return;
    }
    if (!fs.existsSync(ICON_BACKUP_DIR)) {
      fs.mkdirSync(ICON_BACKUP_DIR, { recursive: true });
    }
    if (!fs.existsSync(ICON_FINAL_BACKUP_FILE)) {
      fs.copyFileSync(ICON_OVERRIDES_FILE, ICON_FINAL_BACKUP_FILE, fs.constants.COPYFILE_EXCL);
      console.log(`Icon backup created: ${ICON_FINAL_BACKUP_FILE}`);
    } else {
      console.log(`Icon backup already exists: ${ICON_FINAL_BACKUP_FILE}`);
    }
  } catch (err) {
    console.error('Erro ao criar backup final dos ícones:', err);
  }
}

ensureFinalIconBackup();

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

const ALLOWED_ICON_NAMES = new Set([
  'AlertCircle','AlertOctagon','AlertTriangle','ArrowRight','ArrowUpDown','ArrowUpRight','Award','Bell','BellRing',
  'Calendar','Check','CheckCircle2','ChevronRight','Clock','Cloud','CloudDownload','CloudUpload','Coffee','Compass',
  'Copy','Download','Edit2','ExternalLink','FileText','Flame','Grid','Heart','Info','Key','Lightbulb','Mail','MapPin',
  'Maximize2','MessageCircle','MessageSquare','MessageSquareQuote','Mic','Phone','PhoneCall','Plus','PlusCircle',
  'RefreshCw','RotateCcw','Search','Send','Share2','ShieldCheck','Sliders','SlidersHorizontal','Smartphone','Sparkles',
  'Star','Target','Trash2','TrendingUp','Upload','User','Users','Video','X'
]);

type IconOverridesData = {
  overrides: Record<string,string>;
  updatedAt: string | null;
};

function readIconOverrides(): IconOverridesData {
  try {
    if (!fs.existsSync(ICON_OVERRIDES_FILE)) {
      return { overrides: {}, updatedAt: null };
    }
    const parsed = JSON.parse(fs.readFileSync(ICON_OVERRIDES_FILE, 'utf-8'));
    const source = parsed?.overrides && typeof parsed.overrides === 'object' ? parsed.overrides : {};
    const overrides: Record<string,string> = {};

    for (const [name, raw] of Object.entries(source)) {
      if (ALLOWED_ICON_NAMES.has(name) && typeof raw === 'string' && raw.trim()) {
        overrides[name] = raw;
      }
    }

    return {
      overrides,
      updatedAt: typeof parsed?.updatedAt === 'string' ? parsed.updatedAt : null,
    };
  } catch (err) {
    console.error('Erro ao ler configuração global de ícones:', err);
    return { overrides: {}, updatedAt: null };
  }
}

function writeIconOverrides(overrides: Record<string,string>): IconOverridesData {
  const data: IconOverridesData = {
    overrides,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(ICON_OVERRIDES_FILE, JSON.stringify(data, null, 2), 'utf-8');
  return data;
}

function validateIconOverrides(input: unknown): { ok: true; overrides: Record<string,string> } | { ok: false; error: string } {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, error: 'Formato de ícones inválido.' };
  }

  const overrides: Record<string,string> = {};
  for (const [name, value] of Object.entries(input as Record<string,unknown>)) {
    if (!ALLOWED_ICON_NAMES.has(name)) {
      return { ok: false, error: `Ícone desconhecido: ${name}` };
    }
    if (typeof value !== 'string') {
      return { ok: false, error: `SVG inválido para ${name}.` };
    }
    const raw = value.trim();
    if (!raw) continue;
    if (raw.length > 200000) {
      return { ok: false, error: `SVG muito grande para ${name}.` };
    }
    if (/<(?:script|style|foreignObject|iframe|object|embed)\b/i.test(raw) || /\son[a-z]+\s*=/i.test(raw)) {
      return { ok: false, error: `O SVG de ${name} contém conteúdo não permitido.` };
    }
    overrides[name] = raw;
  }

  return { ok: true, overrides };
}

const authAttempts = new Map<string, { count: number; resetAt: number }>();
const AUTH_WINDOW_MS = 15 * 60 * 1000;
const AUTH_MAX_FAILURES = 5;

function editorClientId(req: Request) {
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function safeKeyEqual(received: string, expected: string) {
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function requireIconEditorAuth(req: Request, res: Response, next: NextFunction) {
  if (!ICON_EDITOR_KEY) {
    return res.status(503).json({ error: 'Editor protegido ainda não configurado no servidor.' });
  }

  const clientId = editorClientId(req);
  const now = Date.now();
  const previous = authAttempts.get(clientId);

  if (previous && previous.resetAt > now && previous.count >= AUTH_MAX_FAILURES) {
    return res.status(429).json({ error: 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.' });
  }

  if (previous && previous.resetAt <= now) {
    authAttempts.delete(clientId);
  }

  const supplied = String(req.get('x-icon-editor-key') || '');
  if (!supplied || !safeKeyEqual(supplied, ICON_EDITOR_KEY)) {
    const current = authAttempts.get(clientId);
    authAttempts.set(clientId, {
      count: (current?.count || 0) + 1,
      resetAt: current?.resetAt && current.resetAt > now ? current.resetAt : now + AUTH_WINDOW_MS,
    });
    return res.status(401).json({ error: 'Chave do editor incorreta.' });
  }

  authAttempts.delete(clientId);
  return next();
}

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: APP_VERSION, serverTime: new Date().toISOString() });
});

// Configuração global de ícones: todos os aparelhos recebem o mesmo conjunto.
app.get('/api/icon-overrides', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  return res.json(readIconOverrides());
});

app.post('/api/icon-overrides/verify', requireIconEditorAuth, (req, res) => {
  return res.json({ success: true });
});

app.put('/api/icon-overrides', requireIconEditorAuth, (req, res) => {
  const validation = validateIconOverrides(req.body?.overrides);
  if ('error' in validation) {
    return res.status(400).json({ error: validation.error });
  }

  try {
    const saved = writeIconOverrides(validation.overrides);
    return res.json({ success: true, ...saved });
  } catch (err) {
    console.error('Erro ao salvar configuração global de ícones:', err);
    return res.status(500).json({ error: 'Não foi possível salvar os ícones globais.' });
  }
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
  if (!IS_PRODUCTION) {
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
    console.log(`Server v${APP_VERSION} running on port ${PORT}`);
    console.log(`Persistent data directory: ${DATA_DIR}`);
  });
}

startServer();

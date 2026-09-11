import React, { useState, useEffect } from 'react';
import { Contact } from '../types';
import {
  Download,
  Upload,
  RotateCcw,
  Smartphone,
  ShieldCheck,
  Sparkles,
  Info,
  CheckCircle2,
  Share2,
  Cloud,
  CloudUpload,
  CloudDownload,
  RefreshCw,
  Key,
  Copy,
  Check,
  Mic,
  MapPin,
  Users,
  MessageSquareQuote,
  BellRing,
  Lightbulb
} from 'lucide-react';

const SUGGESTIONS_LIST = [
  {
    id: 'sug-1',
    icon: MessageSquareQuote,
    badge: 'Comunicação',
    title: 'Sugestor Inteligente de Mensagens Quebra-Gelo Personalizadas',
    prompt: 'Implemente o Sugestor Inteligente de Mensagens Quebra-Gelo Personalizadas no app, gerando opções dinâmicas de mensagens para WhatsApp de acordo com o canal, grau de proximidade e o último assunto salvo na memória social.',
    description: 'Gera sugestões de mensagens contextuais prontas para WhatsApp adaptadas ao grau de intimidade (formal, amigo chegado, familiar) e ao gancho da última conversa registrada para destravar conversas sem esforço.'
  },
  {
    id: 'sug-2',
    icon: Users,
    badge: 'Organização',
    title: 'Árvore de Círculos & Grupos Sociais (Comunidades)',
    prompt: 'Implemente a funcionalidade de Círculos e Grupos de Convivência no app (ex: Família, Faculdade, Trabalho, Amigos de Infância), com visão agregada da saúde social de cada grupo.',
    description: 'Agrupa contatos por círculos sociais (ex: "Faculdade", "Família", "Trabalho", "Amigos da Infância") para você ver a média de atenção, intimidade e frequência de cada núcleo como um todo.'
  },
  {
    id: 'sug-3',
    icon: Mic,
    badge: 'Praticidade',
    title: 'Registro Rápido por Áudio / Ditado de Voz',
    prompt: 'Implemente o Registro Rápido por Áudio/Ditado de Voz para permitir gravar uma nota de voz rápida de 15 segundos logo após um encontro ou ligação, preenchendo automaticamente o resumo da conversa.',
    description: 'Permite gravar notas de voz rápidas de 10 a 20 segundos logo após sair de um encontro ou telefonema usando a API do microfone com transcrição automática para o resumo da interação.'
  },
  {
    id: 'sug-4',
    icon: BellRing,
    badge: 'Proatividade',
    title: 'Notificações Push / Lembretes Matinais Periódicos',
    prompt: 'Implemente Notificações Push com Lembretes Matinais Periódicos no PWA para sugerir reconexões suaves no início do dia sobre contatos que atingiram a data limite.',
    description: 'Envia avisos sutis no início da manhã sugerindo reconexões com quem atingiu a data limite, com atalho direto de 1 toque para abrir o WhatsApp ou agendar um encontro.'
  },
  {
    id: 'sug-5',
    icon: MapPin,
    badge: 'Geolocalização',
    title: 'Radar de Cidades & Viagens ("Quem Mora Aqui?")',
    prompt: 'Implemente o Radar de Cidades e Modo Viagem ("Quem Mora Aqui?") no app, permitindo cadastrar a cidade dos contatos e filtrar por localização ao viajar.',
    description: 'Cadastra a cidade/estado dos contatos para que, ao viajar ou planejar um roteiro, você veja instantaneamente a lista de amigos e conhecidos que residem ali para marcar um reencontro presencial.'
  }
];

interface SettingsViewProps {
  contacts: Contact[];
  onResetToDefault: () => void;
  onImportData: (contacts: Contact[]) => void;
  deferredPrompt: any;
  onInstallPwa: () => void;
  isPwaInstalled: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  contacts,
  onResetToDefault,
  onImportData,
  deferredPrompt,
  onInstallPwa,
  isPwaInstalled,
}) => {
  const [exportSuccess, setExportSuccess] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Cloud Sync state
  const [syncKey, setSyncKey] = useState<string>(() => {
    return localStorage.getItem('social_sync_key') || 'MEU-CIRCULO-01';
  });
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Suggestions copy state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopySuggestion = async (prompt: string, id: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = prompt;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const handleCopyAllSuggestions = async () => {
    const fullText = SUGGESTIONS_LIST.map(
      (s, i) => `${i + 1}. ${s.title}\n${s.description}\nPrompt para implementar: "${s.prompt}"`
    ).join('\n\n');

    try {
      await navigator.clipboard.writeText(fullText);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = fullText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    }
  };

  const handleGenerateKey = () => {
    const random = 'SYNC-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setSyncKey(random);
    localStorage.setItem('social_sync_key', random);
  };

  const handleCloudUpload = async () => {
    if (!syncKey.trim()) {
      setSyncMessage({ text: 'Informe um código de sincronização.', type: 'error' });
      return;
    }
    setSyncLoading(true);
    setSyncMessage(null);
    try {
      localStorage.setItem('social_sync_key', syncKey.trim().toUpperCase());
      const res = await fetch(`/api/sync/${encodeURIComponent(syncKey.trim().toUpperCase())}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts }),
      });
      const data = await res.json();
      if (res.ok) {
        setSyncMessage({
          text: `Nuvem sincronizada com sucesso! (${contacts.length} contatos salvos no cofre ${data.syncKey})`,
          type: 'success',
        });
      } else {
        setSyncMessage({ text: data.error || 'Erro ao sincronizar na nuvem', type: 'error' });
      }
    } catch (e) {
      setSyncMessage({ text: 'Falha ao conectar com o servidor de sincronização.', type: 'error' });
    } finally {
      setSyncLoading(false);
    }
  };

  const handleCloudDownload = async () => {
    if (!syncKey.trim()) {
      setSyncMessage({ text: 'Informe um código de sincronização.', type: 'error' });
      return;
    }
    setSyncLoading(true);
    setSyncMessage(null);
    try {
      localStorage.setItem('social_sync_key', syncKey.trim().toUpperCase());
      const res = await fetch(`/api/sync/${encodeURIComponent(syncKey.trim().toUpperCase())}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.contacts)) {
        onImportData(data.contacts);
        setSyncMessage({
          text: `Dados recuperados da nuvem! ${data.contacts.length} contatos restaurados no app.`,
          type: 'success',
        });
      } else {
        setSyncMessage({
          text: data.error || 'Nenhum dado encontrado para esse código na nuvem.',
          type: 'error',
        });
      }
    } catch (e) {
      setSyncMessage({ text: 'Falha ao conectar com o servidor.', type: 'error' });
    } finally {
      setSyncLoading(false);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(contacts, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `social-sync-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportData(parsed);
          setImportError(null);
          alert('Dados importados com sucesso!');
        } else {
          setImportError('Formato de arquivo inválido. Deve ser uma lista de contatos.');
        }
      } catch (err) {
        setImportError('Erro ao ler arquivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-28 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Ajustes & Aplicativo PWA
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Gerencie a instalação no seu dispositivo, faça cópias de segurança e entenda a lógica de pontuação.
        </p>
      </div>

      {/* PWA Card */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <Smartphone className="w-6 h-6 text-cyan-300" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Instalar como PWA</h2>
            <p className="text-xs text-indigo-200">
              Acesse offline na tela de início do seu celular ou computador sem precisar de loja.
            </p>
          </div>
        </div>

        {isPwaInstalled ? (
          <div className="p-3 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl flex items-center gap-2 text-xs text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>Aplicativo já instalado e operando com suporte offline!</span>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-300 leading-relaxed">
              Você pode fixar o <strong>SocialSync</strong> diretamente na gaveta de aplicativos ou tela de início para receber lembretes periódicos e registrar contatos rapidamente.
            </p>
            <button
              onClick={onInstallPwa}
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-colors shadow-md"
            >
              <Smartphone className="w-4 h-4 text-indigo-600" />
              {deferredPrompt ? 'Instalar Aplicativo Agora' : 'Instalar no Dispositivo'}
            </button>
          </div>
        )}
      </div>

      {/* Sincronização em Nuvem (Multi-dispositivo) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-indigo-600" />
            Sincronização em Nuvem (Multi-dispositivo)
          </h2>
          <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
            Nuvem Ativa
          </span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Use um código exclusivo para sincronizar seus contatos entre seu celular, tablet e computador sem complicação.
        </p>

        {syncMessage && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              syncMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {syncMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{syncMessage.text}</span>
          </div>
        )}

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex-1 relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={syncKey}
                onChange={(e) => setSyncKey(e.target.value.toUpperCase())}
                placeholder="Ex: MEU-CIRCULO-01"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono font-bold text-indigo-900 tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={handleGenerateKey}
              type="button"
              className="px-3 py-2 rounded-xl bg-slate-200/70 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors shrink-0"
            >
              Gerar Novo Código
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={handleCloudUpload}
              disabled={syncLoading}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <CloudUpload className="w-4 h-4" />
              {syncLoading ? 'Enviando...' : 'Salvar Contatos na Nuvem'}
            </button>

            <button
              onClick={handleCloudDownload}
              disabled={syncLoading}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-indigo-700 border border-indigo-200 font-bold text-xs transition-colors disabled:opacity-50"
            >
              <CloudDownload className="w-4 h-4" />
              {syncLoading ? 'Buscando...' : 'Carregar Deste Código'}
            </button>
          </div>
        </div>
      </div>

      {/* Backup & Dados */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          Armazenamento & Backup dos Dados
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Seus dados de contatos, notas de intimidade, importância e histórico de conversas ficam salvos localmente no seu navegador com segurança e privacidade total.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleExport}
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
          >
            <Download className="w-4 h-4 text-slate-600" />
            {exportSuccess ? 'Backup baixado com sucesso!' : 'Exportar Backup (JSON)'}
          </button>

          <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer">
            <Upload className="w-4 h-4 text-slate-600" />
            <span>Restaurar Backup (JSON)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          <button
            onClick={() => {
              if (
                confirm(
                  'Deseja restaurar os contatos e exemplos de demonstração iniciais?'
                )
              ) {
                onResetToDefault();
              }
            }}
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 font-semibold text-xs transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Restaurar Dados de Exemplo
          </button>
        </div>

        {importError && (
          <p className="text-xs text-rose-600 font-medium">{importError}</p>
        )}
      </div>

      {/* Regras e Metodologia do Sistema */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3 text-xs text-slate-600 leading-relaxed">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          Como Funciona o Algoritmo Social
        </h2>

        <div className="space-y-2.5 pt-1">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="font-bold text-slate-900 block text-xs">
              1. Nota de Intimidade (Frequência + Qualidade)
            </span>
            <span className="text-slate-600 mt-0.5 block">
              Calculada dinamicamente: 45% do cumprimento do seu intervalo de contato desejado e 55% da média ponderada da nota de qualidade que você dá a cada conversa registrada.
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="font-bold text-slate-900 block text-xs">
              2. Sua Nota de Importância & Nota de Bem-Estar
            </span>
            <span className="text-slate-600 mt-0.5 block">
              Notas de 1 a 10 atribuídas exclusivamente por você ao cadastrar ou editar a pessoa, representando o valor da pessoa na sua vida e o quanto estar com ela te faz bem.
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="font-bold text-slate-900 block text-xs">
              3. Painel de Priorização de Negligenciados
            </span>
            <span className="text-slate-600 mt-0.5 block">
              Cruza o atraso em dias com a nota de Importância e Bem-Estar. Pessoas vitais e que fazem muito bem que estão sem contato sobem automaticamente para o topo do radar com alerta visual.
            </span>
          </div>
        </div>
      </div>

      {/* Cartão de Próximas Sugestões & Melhorias para Implementar */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-white/10 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center shrink-0 mt-0.5">
              <Lightbulb className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Próximas Sugestões de Melhorias
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30">
                  Roadmap
                </span>
              </div>
              <p className="text-xs text-indigo-200/90 mt-0.5 max-w-xl">
                Funcionalidades anotadas prontas para evoluir o app. Toque no botão de cópia de qualquer item para levar de volta ao chat e implementarmos!
              </p>
            </div>
          </div>

          <button
            onClick={handleCopyAllSuggestions}
            type="button"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-all shrink-0 active:scale-95"
          >
            {copiedAll ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Todas Copiadas!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-indigo-200" />
                <span>Copiar Todas</span>
              </>
            )}
          </button>
        </div>

        {/* Lista de Sugestões Detalhadas */}
        <div className="space-y-3 pt-1">
          {SUGGESTIONS_LIST.map((sug, index) => {
            const Icon = sug.icon;
            const isCopied = copiedId === sug.id;

            return (
              <div
                key={sug.id}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 transition-all duration-200 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                      <Icon className="w-4 h-4 text-cyan-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {index + 1}. {sug.title}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-indigo-200 font-medium">
                          {sug.badge}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopySuggestion(sug.prompt, sug.id)}
                    type="button"
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 active:scale-95 ${
                      isCopied
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                        : 'bg-white/10 hover:bg-white/20 text-indigo-100 border border-white/20'
                    }`}
                    title="Copiar prompt desta sugestão para o chat"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Pedido</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pl-10">
                  {sug.description}
                </p>

                <div className="pl-10 pt-1">
                  <div className="p-2 rounded-xl bg-black/25 border border-white/5 text-[11px] text-indigo-200 font-mono flex items-center justify-between gap-2">
                    <span className="truncate italic">
                      “{sug.prompt}”
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

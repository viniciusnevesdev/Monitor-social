import React, { useMemo, useState } from 'react';
import {
  ICON_COMPONENTS,
  ICON_NAMES,
  AppIconName,
  getAllIconOverrides,
  resetIconOverride,
  sanitizeCustomSvg,
  setIconOverride,
} from '../icons';
import { APP_VERSION } from '../version';

interface IconEditorViewProps {
  onClose: () => void;
}

function labelFor(name: string) {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
}

export const IconEditorView: React.FC<IconEditorViewProps> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [overrides, setOverrides] = useState<Record<string,string>>(() => getAllIconOverrides());
  const [drafts, setDrafts] = useState<Record<string,string>>(() => ({ ...getAllIconOverrides() }));
  const [message, setMessage] = useState('');

  const visibleIcons = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ICON_NAMES.filter((name) => !q || labelFor(name).toLowerCase().includes(q) || name.toLowerCase().includes(q));
  }, [query]);

  const apply = (name: AppIconName) => {
    const raw = (drafts[name] || '').trim();
    if (!raw) {
      setMessage('Cole um SVG antes de aplicar.');
      return;
    }
    if (!sanitizeCustomSvg(raw)) {
      setMessage('Esse código SVG não é válido.');
      return;
    }
    try {
      setIconOverride(name, raw);
      const next = getAllIconOverrides();
      setOverrides(next);
      setDrafts((prev) => ({ ...prev, [name]: next[name] || '' }));
      setMessage(`${labelFor(name)} atualizado.`);
    } catch {
      setMessage('Não foi possível aplicar esse SVG.');
    }
  };

  const restore = (name: AppIconName) => {
    resetIconOverride(name);
    setOverrides(getAllIconOverrides());
    setDrafts((prev) => ({ ...prev, [name]: '' }));
    setMessage(`${labelFor(name)} restaurado ao desenho original.`);
  };

  const paste = async (name: AppIconName) => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) throw new Error();
      setDrafts((prev) => ({ ...prev, [name]: text }));
      setMessage('SVG colado no campo.');
    } catch {
      setMessage('Não consegui ler a área de transferência. Cole manualmente.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-indigo-300 hover:text-indigo-200"
            >
              ← Voltar ao app
            </button>
            <div className="mt-1 flex items-center gap-2">
              <h1 className="text-xl font-bold">Editor de ícones</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-200 border border-indigo-400/20">
                v{APP_VERSION}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {ICON_NAMES.length} ícones usados no aplicativo. Aceita SVG completo, fragmentos, XML e códigos JSX/React. Stroke continua stroke; fill continua fill.
            </p>
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar ícone…"
            className="w-full sm:w-64 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-400/50"
          />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-5 pb-24">
        <div className="mb-4 rounded-2xl border border-indigo-400/15 bg-indigo-500/8 px-4 py-3 text-xs text-slate-300 leading-relaxed">
          Não existe controle de peso, espessura ou contorno. Você pode colar um SVG completo, um fragmento como <code className="text-indigo-200">&lt;path&gt;</code>, código com cabeçalho XML ou SVG copiado de JSX/React. O editor normaliza apenas o formato técnico e preserva a geometria visual.
        </div>

        {message && (
          <div className="mb-4 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {visibleIcons.map((name) => {
            const Icon = ICON_COMPONENTS[name];
            const custom = Boolean(overrides[name]);
            const draft = drafts[name] ?? '';

            return (
              <article key={name} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 grid place-items-center text-slate-100">
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="min-w-0">
                    <strong className="block text-sm">{labelFor(name)}</strong>
                    <span className="block text-[10px] text-slate-500 mt-0.5">{name}</span>
                    <span className={`inline-block mt-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full border ${custom ? 'text-emerald-300 border-emerald-400/20 bg-emerald-400/10' : 'text-slate-400 border-white/10 bg-white/5'}`}>
                      {custom ? 'PERSONALIZADO' : 'PADRÃO'}
                    </span>
                  </div>
                </div>

                <textarea
                  value={draft}
                  onChange={(e) => setDrafts((prev) => ({ ...prev, [name]: e.target.value }))}
                  spellCheck={false}
                  placeholder={`Cole aqui o SVG que substituirá ${labelFor(name)}`}
                  className="mt-3 w-full min-h-28 resize-y rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 font-mono text-[10px] leading-relaxed text-slate-200 placeholder:text-slate-600 outline-none focus:border-indigo-400/50"
                />

                <div className="grid grid-cols-3 gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => paste(name)}
                    className="rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-[10px] font-bold text-slate-300"
                  >
                    Colar SVG
                  </button>
                  <button
                    type="button"
                    onClick={() => restore(name)}
                    disabled={!custom}
                    className="rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-[10px] font-bold text-rose-300 disabled:opacity-35"
                  >
                    Restaurar
                  </button>
                  <button
                    type="button"
                    onClick={() => apply(name)}
                    className="rounded-xl bg-indigo-600 px-2 py-2 text-[10px] font-bold text-white"
                  >
                    Aplicar SVG
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {!visibleIcons.length && (
          <div className="py-16 text-center text-sm text-slate-500">Nenhum ícone encontrado.</div>
        )}
      </main>
    </div>
  );
};

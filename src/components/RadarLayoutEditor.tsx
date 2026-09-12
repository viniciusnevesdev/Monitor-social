import React, { useEffect, useRef, useState } from 'react';
import { Contact } from '../types';
import { computeContactScores } from '../utils/calculations';
import {
  cloneRadarLayout,
  DEFAULT_RADAR_CARD_LAYOUT,
  patchRadarElement,
  RadarCardLayout,
  RadarElementId,
  RADAR_ELEMENT_LABELS,
  RADAR_TEXT_ELEMENTS,
} from '../utils/radarLayout';
import { Download, RotateCcw, X } from '../icons';
import { RadarContactCard } from './RadarContactCard';

interface RadarLayoutEditorProps {
  contact: Contact;
  initialLayout: RadarCardLayout;
  onChange: (layout: RadarCardLayout) => void;
  onClose: () => void;
}

type DragState = {
  mode: 'move' | 'resize';
  id: RadarElementId;
  startX: number;
  startY: number;
  initial: RadarCardLayout;
} | null;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const RadarLayoutEditor: React.FC<RadarLayoutEditorProps> = ({
  contact,
  initialLayout,
  onChange,
  onClose,
}) => {
  const [draft, setDraft] = useState(() => cloneRadarLayout(initialLayout));
  const [history, setHistory] = useState<RadarCardLayout[]>(() => [cloneRadarLayout(initialLayout)]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selected, setSelected] = useState<RadarElementId>('avatar');
  const [copied, setCopied] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const draftRef = useRef(draft);
  const dragRef = useRef<DragState>(null);

  const applyLive = (next: RadarCardLayout) => {
    const safe = cloneRadarLayout(next);
    draftRef.current = safe;
    setDraft(safe);
    onChange(safe);
  };

  const commit = (next: RadarCardLayout) => {
    applyLive(next);
    setHistory((previous) => {
      const reduced = previous.slice(0, historyIndex + 1);
      const updated = [...reduced, cloneRadarLayout(next)].slice(-60);
      setHistoryIndex(updated.length - 1);
      return updated;
    });
  };

  const undo = () => {
    if (historyIndex === 0) return;
    const nextIndex = historyIndex - 1;
    setHistoryIndex(nextIndex);
    applyLive(history[nextIndex]);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const nextIndex = historyIndex + 1;
    setHistoryIndex(nextIndex);
    applyLive(history[nextIndex]);
  };

  const setElement = (patch: Parameters<typeof patchRadarElement>[2], save = true) => {
    const next = patchRadarElement(draftRef.current, selected, patch);
    if (save) commit(next);
    else applyLive(next);
  };

  const align = (direction: 'left' | 'center-x' | 'right' | 'top' | 'center-y' | 'bottom') => {
    const item = draftRef.current.elements[selected];
    if (direction === 'left') setElement({ x: 6 });
    if (direction === 'center-x') setElement({ x: (100 - item.w) / 2 });
    if (direction === 'right') setElement({ x: 94 - item.w });
    if (direction === 'top') setElement({ y: 6 });
    if (direction === 'center-y') setElement({ y: (100 - item.h) / 2 });
    if (direction === 'bottom') setElement({ y: 94 - item.h });
  };

  const startDrag = (id: RadarElementId, event: React.PointerEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragRef.current = {
      mode: 'move',
      id,
      startX: event.clientX,
      startY: event.clientY,
      initial: cloneRadarLayout(draftRef.current),
    };
  };

  const startResize = (id: RadarElementId, event: React.PointerEvent<HTMLSpanElement>) => {
    if (!stageRef.current) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragRef.current = {
      mode: 'resize',
      id,
      startX: event.clientX,
      startY: event.clientY,
      initial: cloneRadarLayout(draftRef.current),
    };
  };

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const drag = dragRef.current;
      const stage = stageRef.current;
      if (!drag || !stage) return;
      const bounds = stage.getBoundingClientRect();
      const original = drag.initial.elements[drag.id];
      const deltaX = ((event.clientX - drag.startX) / bounds.width) * 100;
      const deltaY = ((event.clientY - drag.startY) / bounds.height) * 100;
      const next = patchRadarElement(
        drag.initial,
        drag.id,
        drag.mode === 'resize'
          ? { w: original.w + deltaX, h: original.h + deltaY }
          : { x: original.x + deltaX, y: original.y + deltaY }
      );
      applyLive(next);
    };
    const end = () => {
      if (!dragRef.current) return;
      dragRef.current = null;
      commit(draftRef.current);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
    };
  }, [historyIndex]);

  const restoreDefault = () => {
    if (!window.confirm('Restaurar o modelo original do Radar? As suas alterações atuais deste layout serão desfeitas.')) return;
    commit(cloneRadarLayout(DEFAULT_RADAR_CARD_LAYOUT));
  };

  const exportLayout = async () => {
    const source = JSON.stringify(draftRef.current, null, 2);
    const blob = new Blob([source], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'lacos-layout-radar.json';
    anchor.click();
    URL.revokeObjectURL(url);
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // No iPhone a exportação continua funcionando mesmo sem permissão de área de transferência.
    }
  };

  const selectedLayout = draft.elements[selected];
  const isText = RADAR_TEXT_ELEMENTS.includes(selected);

  return (
    <div className="radar-editor-backdrop" role="dialog" aria-modal="true" aria-label="Editor do cartão Radar">
      <section className="radar-editor-panel">
        <header className="radar-editor-header">
          <div>
            <span className="radar-editor-kicker">BETA · Editor visual</span>
            <h1>Modelo do cartão Radar</h1>
            <p>Arraste um elemento na prévia ou ajuste suas medidas abaixo. O modelo vale para todos os contatos.</p>
          </div>
          <button className="radar-editor-close" type="button" onClick={onClose} aria-label="Fechar editor">
            <X />
          </button>
        </header>

        <div className="radar-editor-actions">
          <button type="button" onClick={undo} disabled={historyIndex === 0}>↶ Desfazer</button>
          <button type="button" onClick={redo} disabled={historyIndex === history.length - 1}>↷ Refazer</button>
          <button type="button" onClick={restoreDefault}><RotateCcw /> Original</button>
          <button type="button" className="radar-editor-export" onClick={exportLayout}><Download /> Exportar</button>
        </div>
        {copied && <p className="radar-editor-notice">Layout exportado e copiado. Você pode me enviar o arquivo.</p>}

        <div className="radar-editor-content">
          <div className="radar-editor-preview-wrap">
            <p className="radar-editor-section-label">Prévia editável</p>
            <div className="radar-editor-stage" ref={stageRef}>
              <RadarContactCard
                contact={contact}
                scores={computeContactScores(contact)}
                layout={draft}
                editingElement={selected}
                onSelectElement={setSelected}
                onElementPointerDown={startDrag}
                onElementResizePointerDown={startResize}
              />
            </div>
            <p className="radar-editor-hint">Toque e arraste. As linhas pontilhadas ajudam a encaixar os elementos; nada sai do cartão.</p>
          </div>

          <div className="radar-editor-controls">
            <p className="radar-editor-section-label">Elemento selecionado</p>
            <div className="radar-editor-elements">
              {(Object.keys(RADAR_ELEMENT_LABELS) as RadarElementId[]).map((id) => (
                <button key={id} type="button" onClick={() => setSelected(id)} className={selected === id ? 'is-selected' : ''}>
                  {RADAR_ELEMENT_LABELS[id]}
                </button>
              ))}
            </div>

            <div className="radar-align-grid">
              <span>Alinhar</span>
              <div>
                <button type="button" onClick={() => align('left')} aria-label="Alinhar à esquerda">←</button>
                <button type="button" onClick={() => align('center-x')} aria-label="Centralizar horizontalmente">↔</button>
                <button type="button" onClick={() => align('right')} aria-label="Alinhar à direita">→</button>
                <button type="button" onClick={() => align('top')} aria-label="Alinhar ao topo">↑</button>
                <button type="button" onClick={() => align('center-y')} aria-label="Centralizar verticalmente">↕</button>
                <button type="button" onClick={() => align('bottom')} aria-label="Alinhar à base">↓</button>
              </div>
            </div>

            <div className="radar-slider-grid">
              {([
                ['x', 'Horizontal', selectedLayout.x, 0, 92],
                ['y', 'Vertical', selectedLayout.y, 0, 92],
                ['w', 'Largura da caixa', selectedLayout.w, 8, 94],
                ['h', 'Altura da caixa', selectedLayout.h, 6, 92],
              ] as const).map(([key, label, value, min, max]) => (
                <label key={key}>
                  <span>{label}<b>{Math.round(value)}%</b></span>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    value={value}
                    onChange={(event) => setElement({ [key]: Number(event.target.value) }, false)}
                    onPointerUp={() => commit(draftRef.current)}
                  />
                </label>
              ))}
            </div>

            {isText && (
              <div className="radar-text-controls">
                <label>
                  <span>Tamanho <b>{selectedLayout.fontSize || 12}px</b></span>
                  <input
                    type="range"
                    min="9"
                    max="30"
                    value={selectedLayout.fontSize || 12}
                    onChange={(event) => setElement({ fontSize: Number(event.target.value) }, false)}
                    onPointerUp={() => commit(draftRef.current)}
                  />
                </label>
                <label>
                  Peso
                  <select value={selectedLayout.fontWeight || 500} onChange={(event) => setElement({ fontWeight: Number(event.target.value) as 400 | 500 | 600 | 700 | 800 })}>
                    <option value="400">Regular</option><option value="500">Médio</option><option value="600">Semibold</option><option value="700">Negrito</option><option value="800">Extra negrito</option>
                  </select>
                </label>
                <label>
                  Cor
                  <input type="color" value={selectedLayout.color || '#64748b'} onChange={(event) => setElement({ color: event.target.value })} />
                </label>
                <label>
                  Alinhamento
                  <select value={selectedLayout.align || 'left'} onChange={(event) => setElement({ align: event.target.value as 'left' | 'center' | 'right' })}>
                    <option value="left">Esquerda</option><option value="center">Centro</option><option value="right">Direita</option>
                  </select>
                </label>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

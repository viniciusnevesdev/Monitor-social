import React, { useState } from 'react';
import { Contact } from '../types';
import { computeContactScores, formatTimeAgo, CATEGORY_LABELS } from '../utils/calculations';
import { ScoreBadge } from './ScoreBadge';
import {
  Grid,
  Info,
  Sparkles,
  AlertOctagon,
  Heart,
  Star,
  PlusCircle,
  MessageCircle,
  ArrowUpRight,
  Maximize2
} from 'lucide-react';

interface RelationshipMatrixProps {
  contacts: Contact[];
  onSelectContact: (contactId: string) => void;
  onOpenLogModal: (contactId?: string) => void;
}

export const RelationshipMatrix: React.FC<RelationshipMatrixProps> = ({
  contacts,
  onSelectContact,
  onOpenLogModal,
}) => {
  const [hoveredContactId, setHoveredContactId] = useState<string | null>(null);
  const [selectedQuadrantFilter, setSelectedQuadrantFilter] = useState<string>('todos');

  const contactsWithScores = contacts.map((contact) => {
    const scores = computeContactScores(contact);
    // Y: Impacto Emocional (Importância + Bem-estar) -> 1 a 10
    const personalImpact = (contact.importanceRating * 0.55 + contact.wellbeingRating * 0.45);
    
    // X: Razão de Atraso -> 0 (acabou de falar) a 2.5 (muito atrasado)
    // 0 a 1 = Dentro da meta (Em dia)
    // > 1 = Atrasado / Negligenciado
    const ratio = scores.daysSinceLastInteraction / Math.max(1, contact.targetIntervalDays);
    const normalizedX = Math.min(2.5, ratio); // clamp

    // Determinar quadrante
    const isHighImpact = personalImpact >= 7.5;
    const isOverdue = ratio > 1.0;

    let quadrant = 'ouro';
    if (isHighImpact && !isOverdue) quadrant = 'ouro'; // Alto impacto, em dia
    else if (isHighImpact && isOverdue) quadrant = 'alerta'; // Alto impacto, atrasado!
    else if (!isHighImpact && !isOverdue) quadrant = 'casual_ativo';
    else quadrant = 'em_pausa';

    return {
      contact,
      scores,
      personalImpact,
      ratio,
      normalizedX,
      quadrant,
    };
  });

  const activeContact = contactsWithScores.find((c) => c.contact.id === hoveredContactId);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Grid className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Matriz de Relacionamentos & Impacto
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Visualização em quadrantes: cruza o <strong>Impacto Pessoal (Importância + Bem-estar)</strong> no eixo vertical com o <strong>Tempo sem Contato</strong> no eixo horizontal.
          </p>
        </div>

        {/* Legendas de Quadrante */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-semibold border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Zona Crítica (Reconectar!)
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Zona de Ouro (Em Dia)
          </span>
        </div>
      </div>

      {/* Canvas / Container da Matriz Interativa */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] max-h-[460px] bg-slate-50/70 rounded-2xl border border-slate-200 overflow-hidden select-none">
        {/* Linhas divisorias dos 4 Quadrantes */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
          {/* Top-Left: Zona de Ouro */}
          <div className="border-r border-b border-dashed border-slate-300 p-3 bg-emerald-50/20 relative">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100/70 px-2 py-0.5 rounded-md">
              Zona de Ouro (Laços Vivos)
            </span>
          </div>

          {/* Top-Right: Zona Crítica */}
          <div className="border-b border-dashed border-slate-300 p-3 bg-rose-50/30 relative">
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider bg-rose-100/80 px-2 py-0.5 rounded-md flex items-center gap-1 w-fit">
              <AlertOctagon className="w-3 h-3 text-rose-600" />
              Zona Crítica (Atraso Alto)
            </span>
          </div>

          {/* Bottom-Left: Conexões em Dia */}
          <div className="border-r border-dashed border-slate-300 p-3 bg-sky-50/15 relative">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-200/60 px-2 py-0.5 rounded-md">
              Círculo Casual Ativo
            </span>
          </div>

          {/* Bottom-Right: Em Pausa */}
          <div className="p-3 bg-slate-100/30 relative">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-200/50 px-2 py-0.5 rounded-md">
              Conexões em Pausa
            </span>
          </div>
        </div>

        {/* Eixo Rótulos */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 -rotate-90 origin-left text-[10px] font-bold text-slate-400 uppercase tracking-widest pointer-events-none">
          ↑ Maior Importância & Bem-Estar
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-widest pointer-events-none">
          ← Em Dia &bull; Tempo de Atraso →
        </div>

        {/* Pontos / Avatares dos Contatos na Matriz */}
        {contactsWithScores.map(({ contact, scores, personalImpact, ratio, normalizedX }) => {
          // X: ratio de 0 (0%) a 2.5 (100%)
          const xPercent = Math.max(6, Math.min(94, (normalizedX / 2.2) * 100));
          // Y: personalImpact de 1 a 10 (invertido porque 10 é no topo)
          const yPercent = Math.max(8, Math.min(92, 100 - ((personalImpact - 1) / 9) * 100));

          const isHovered = hoveredContactId === contact.id;
          const isNeglected = scores.status === 'negligenciado';

          return (
            <div
              key={contact.id}
              onClick={() => onSelectContact(contact.id)}
              onMouseEnter={() => setHoveredContactId(contact.id)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-200 group z-20"
              style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
            >
              {/* Avatar Bubble */}
              <div
                className={`relative flex items-center justify-center rounded-2xl text-white font-bold text-xs shadow-md transition-all duration-300 ${
                  isHovered
                    ? 'w-11 h-11 scale-125 ring-4 ring-indigo-500 z-30 shadow-xl'
                    : isNeglected
                    ? 'w-9 h-9 ring-2 ring-rose-400 animate-bounce shadow-rose-500/20'
                    : 'w-8 h-8 hover:scale-110'
                }`}
                style={{ backgroundColor: contact.avatarColor || '#6366f1' }}
              >
                {contact.name.charAt(0).toUpperCase()}

                {/* Badge de alerta se negligenciado */}
                {isNeglected && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white ring-1 ring-rose-300" />
                )}
              </div>

              {/* Tag com o nome */}
              <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 rounded-md bg-white/90 backdrop-blur-xs border border-slate-200 text-[10px] font-bold text-slate-800 whitespace-nowrap opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all shadow-xs">
                {contact.nickname || contact.name.split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mini-Card com detalhes do contato hovered ou selecionado */}
      {activeContact ? (
        <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-base shrink-0 shadow-sm"
              style={{ backgroundColor: activeContact.contact.avatarColor || '#6366f1' }}
            >
              {activeContact.contact.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-900 text-sm">
                  {activeContact.contact.name}
                  {activeContact.contact.nickname && ` (${activeContact.contact.nickname})`}
                </h4>
                <ScoreBadge type="status" value={activeContact.scores.status} size="sm" />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1">
                <span>Última conversa: <strong>{formatTimeAgo(activeContact.scores.daysSinceLastInteraction)}</strong></span>
                <span>•</span>
                <span>Meta: a cada {activeContact.contact.targetIntervalDays}d</span>
                <span>•</span>
                <span>Intimidade: <strong>{activeContact.scores.intimacyScore}/10</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => onOpenLogModal(activeContact.contact.id)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Registrar
            </button>
            <button
              onClick={() => onSelectContact(activeContact.contact.id)}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs transition-colors"
            >
              Ver Perfil
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center text-xs text-slate-400 py-1">
          Toque em qualquer bolha na matriz para ver o status imediato e registrar conversa.
        </p>
      )}
    </div>
  );
};

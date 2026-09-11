import React from 'react';
import { Contact } from '../types';
import { computeContactScores, formatTimeAgo } from '../utils/calculations';
import {
  Sparkles,
  TrendingUp,
  Award,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  MessageCircle,
  PlusCircle
} from 'lucide-react';

interface WeeklySocialDigestProps {
  contacts: Contact[];
  onOpenLogModal: (contactId?: string) => void;
  onOpenContactDetail: (contactId: string) => void;
}

export const WeeklySocialDigest: React.FC<WeeklySocialDigestProps> = ({
  contacts,
  onOpenLogModal,
  onOpenContactDetail,
}) => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Contabilizar interações nos últimos 7 dias
  let interactionsThisWeek = 0;
  contacts.forEach((c) => {
    (c.interactions || []).forEach((int) => {
      const d = new Date(int.date);
      if (d >= sevenDaysAgo && d <= now) {
        interactionsThisWeek++;
      }
    });
  });

  const contactsWithScores = contacts.map((contact) => ({
    contact,
    scores: computeContactScores(contact),
  }));

  // Pessoas em dia vs negligenciadas
  const onTrackCount = contactsWithScores.filter((c) => c.scores.status === 'em_dia').length;
  const healthPercentage = contacts.length > 0 ? Math.round((onTrackCount / contacts.length) * 100) : 0;

  // Top 3 pessoas prioritárias para focar esta semana
  const topPriorityThisWeek = [...contactsWithScores]
    .sort((a, b) => b.scores.priorityScore - a.scores.priorityScore)
    .slice(0, 3);

  return (
    <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden space-y-5">
      {/* Decorative ambient blur */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </span>
          <div>
            <span className="text-[11px] uppercase font-bold text-indigo-300 tracking-wider">
              Resumo Semanal de Conexões
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Social Digest dos Últimos 7 Dias
            </h3>
          </div>
        </div>

        <div className="text-right">
          <span className="text-2xl font-black text-amber-300">{interactionsThisWeek}</span>
          <span className="block text-[11px] text-indigo-200">conversas mantidas</span>
        </div>
      </div>

      {/* Progress & Highlights Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
          <span className="text-indigo-200 block text-[11px]">Saúde da Rede Social</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xl font-bold text-white">{healthPercentage}%</span>
            <span className="text-[10px] text-emerald-300 font-semibold bg-emerald-500/20 px-1.5 py-0.5 rounded">
              {onTrackCount} de {contacts.length} em dia
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
          <span className="text-indigo-200 block text-[11px]">Meta de Interações</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xl font-bold text-white">
              {interactionsThisWeek >= 3 ? 'Meta Atingida!' : `${interactionsThisWeek}/3`}
            </span>
            <CheckCircle2 className={`w-4 h-4 ${interactionsThisWeek >= 3 ? 'text-emerald-300' : 'text-slate-400'}`} />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
          <span className="text-indigo-200 block text-[11px]">Foco Recomendado</span>
          <span className="font-bold text-white text-sm block mt-1">
            {topPriorityThisWeek[0]?.contact.name.split(' ')[0] || 'Tudo em dia'}
          </span>
          <span className="text-[10px] text-amber-200 block">Prioridade número 1</span>
        </div>
      </div>

      {/* Plano de Ação Semanal: 3 Pessoas Críticas com Gancho Contextual */}
      <div className="space-y-2 pt-1">
        <span className="text-xs font-bold text-indigo-200 block">
          Plano de Conexões Recomendadas para Esta Semana:
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {topPriorityThisWeek.map(({ contact, scores }) => {
            // Último gancho de conversa salvo na memória social
            const latestInteraction = (contact.interactions || [])[0];
            const memoryHook = latestInteraction?.nextTopicHook;

            return (
              <div
                key={contact.id}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 flex flex-col justify-between hover:bg-white/15 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                        style={{ backgroundColor: contact.avatarColor || '#6366f1' }}
                      >
                        {contact.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-white text-xs block leading-tight">
                          {contact.name}
                        </span>
                        <span className="text-[10px] text-indigo-200">
                          {formatTimeAgo(scores.daysSinceLastInteraction)}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        scores.status === 'negligenciado'
                          ? 'bg-rose-500/30 text-rose-200 border border-rose-400/40'
                          : 'bg-amber-500/30 text-amber-200 border border-amber-400/40'
                      }`}
                    >
                      {scores.status === 'negligenciado' ? 'Urgente' : 'Atenção'}
                    </span>
                  </div>

                  {/* Memória Social / Gancho do próximo assunto */}
                  {memoryHook ? (
                    <div className="mt-2.5 p-2 rounded-xl bg-amber-500/15 border border-amber-400/20 text-[11px] text-amber-100 flex items-start gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
                      <span className="line-clamp-2 italic">“{memoryHook}”</span>
                    </div>
                  ) : (
                    <p className="mt-2 text-[11px] text-indigo-200/80">
                      Importância {contact.importanceRating}/10 &bull; Bem-estar {contact.wellbeingRating}/10
                    </p>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => onOpenLogModal(contact.id)}
                    className="text-[11px] text-cyan-300 hover:text-cyan-200 font-bold flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Registrar
                  </button>

                  <button
                    onClick={() => onOpenContactDetail(contact.id)}
                    className="text-[11px] text-slate-300 hover:text-white font-medium flex items-center gap-1"
                  >
                    Ver perfil
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Contact, CalculatedScores } from '../types';
import { computeContactScores, formatTimeAgo, CATEGORY_LABELS } from '../utils/calculations';
import { ScoreBadge } from './ScoreBadge';
import { WeeklySocialDigest } from './WeeklySocialDigest';
import { RelationshipMatrix } from './RelationshipMatrix';
import {
  MessageCircle,
  PhoneCall,
  PlusCircle,
  Lightbulb,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertOctagon,
  Heart,
  Star,
  Grid
} from 'lucide-react';

interface NeglectedDashboardProps {
  contacts: Contact[];
  onOpenLogModal: (contactId?: string) => void;
  onOpenContactDetail: (contactId: string) => void;
  onOpenNewContactModal: () => void;
  onNavigateToTab: (tab: any) => void;
  onOpenScheduleModal?: (contact: Contact) => void;
}

const ICEBREAKER_SUGGESTIONS = [
  '“Vi isso e lembrei de você! Como estão as coisas por aí?”',
  '“Passando só para saber como você está. Vamos marcar um café ou uma ligação rápida essa semana?”',
  '“Estava pensando no nosso último papo. O que tem feito de bom ultimamente?”',
  '“Saudades! Queria saber as novidades da sua vida.”',
  '“Lembrei de você hoje! Espero que sua semana esteja sendo ótima.”',
];

export const NeglectedDashboard: React.FC<NeglectedDashboardProps> = ({
  contacts,
  onOpenLogModal,
  onOpenContactDetail,
  onOpenNewContactModal,
  onNavigateToTab,
  onOpenScheduleModal,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('todos');
  const [expandedIcebreakerId, setExpandedIcebreakerId] = useState<string | null>(null);
  const [showMatrix, setShowMatrix] = useState<boolean>(true);

  // Calcular scores para cada contato
  const contactsWithScores = contacts.map((contact) => ({
    contact,
    scores: computeContactScores(contact),
  }));

  // Estatísticas globais
  const totalContacts = contacts.length;
  const neglectedList = contactsWithScores.filter((item) => item.scores.status === 'negligenciado');
  const attentionList = contactsWithScores.filter((item) => item.scores.status === 'atencao');
  const onTrackList = contactsWithScores.filter((item) => item.scores.status === 'em_dia');

  // Média de intimidade e bem-estar
  const avgIntimacy = totalContacts > 0
    ? (contactsWithScores.reduce((acc, curr) => acc + curr.scores.intimacyScore, 0) / totalContacts).toFixed(1)
    : '0.0';

  // Ordenar prioritariamente por prioridade de negligência descendente
  const prioritizedList = [...contactsWithScores].sort(
    (a, b) => b.scores.priorityScore - a.scores.priorityScore
  );

  // Filtrar por categoria selecionada
  const displayedContacts = prioritizedList.filter((item) => {
    if (filterCategory === 'todos') return true;
    if (filterCategory === 'urgentes') return item.scores.status === 'negligenciado';
    return item.contact.category === filterCategory;
  });

  return (
    <div className="space-y-6 pb-28">
      {/* Header com boas-vindas e síntese do radar social */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl shadow-indigo-500/10 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md border border-white/20 text-indigo-100">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                Painel de Conexões Sociais
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-2">
                Prioridades de Relacionamento
              </h1>
              <p className="text-sm text-indigo-100/90 mt-1 max-w-xl">
                Monitore interações, proteja laços essenciais e reconecte-se com pessoas queridas que ficaram sem contato.
              </p>
            </div>

            <button
              id="dashboard-new-log-btn"
              onClick={() => onOpenLogModal()}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-indigo-700 font-semibold text-sm hover:bg-indigo-50 active:scale-95 transition-all shadow-md shadow-black/10"
            >
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              Registrar Conversa
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15">
              <div className="flex items-center justify-between">
                <span className="text-xs text-indigo-200">Negligenciados</span>
                <AlertOctagon className="w-4 h-4 text-rose-300" />
              </div>
              <div className="text-2xl font-bold text-white mt-1">
                {neglectedList.length}
              </div>
              <span className="text-[11px] text-rose-200 font-medium">Requer atenção urgente</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15">
              <div className="flex items-center justify-between">
                <span className="text-xs text-indigo-200">Em Atenção</span>
                <Calendar className="w-4 h-4 text-amber-300" />
              </div>
              <div className="text-2xl font-bold text-white mt-1">
                {attentionList.length}
              </div>
              <span className="text-[11px] text-amber-200 font-medium">Prazo de contato próximo</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15">
              <div className="flex items-center justify-between">
                <span className="text-xs text-indigo-200">Em Dia</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              </div>
              <div className="text-2xl font-bold text-white mt-1">
                {onTrackList.length}
              </div>
              <span className="text-[11px] text-emerald-200 font-medium">Conexões ativas</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15">
              <div className="flex items-center justify-between">
                <span className="text-xs text-indigo-200">Média Intimidade</span>
                <TrendingUp className="w-4 h-4 text-cyan-300" />
              </div>
              <div className="text-2xl font-bold text-white mt-1">
                {avgIntimacy}
                <span className="text-xs font-normal text-indigo-200">/10</span>
              </div>
              <span className="text-[11px] text-cyan-200 font-medium">Frequência + Qualidade</span>
            </div>
          </div>
        </div>
      </section>

      {/* Resumo Semanal de Conexões (Social Digest) */}
      <WeeklySocialDigest
        contacts={contacts}
        onOpenLogModal={onOpenLogModal}
        onOpenContactDetail={onOpenContactDetail}
      />

      {/* Matriz Visual de Relacionamentos (Quadrantes) */}
      <RelationshipMatrix
        contacts={contacts}
        onSelectContact={onOpenContactDetail}
        onOpenLogModal={onOpenLogModal}
      />

      {/* Seção Principal: Contatos Prioritários */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Radar de Contatos</span>
              {neglectedList.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                  {neglectedList.length} precisam de atenção
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500">
              Ordenado pela fórmula de negligência (dias sem contato + sua nota de importância + bem-estar).
            </p>
          </div>

          {/* Filtros em pílulas */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs no-scrollbar">
            <button
              onClick={() => setFilterCategory('todos')}
              type="button"
              className={`px-3 py-1.5 rounded-full font-medium transition-all shrink-0 ${
                filterCategory === 'todos'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Todos ({contacts.length})
            </button>
            <button
              onClick={() => setFilterCategory('urgentes')}
              type="button"
              className={`px-3 py-1.5 rounded-full font-medium transition-all shrink-0 flex items-center gap-1 ${
                filterCategory === 'urgentes'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50'
              }`}
            >
              <AlertOctagon className="w-3 h-3" />
              Negligenciados ({neglectedList.length})
            </button>
            <button
              onClick={() => setFilterCategory('familia')}
              type="button"
              className={`px-3 py-1.5 rounded-full font-medium transition-all shrink-0 ${
                filterCategory === 'familia'
                  ? 'bg-pink-600 text-white shadow-sm'
                  : 'bg-white text-pink-600 border border-pink-200 hover:bg-pink-50'
              }`}
            >
              Família
            </button>
            <button
              onClick={() => setFilterCategory('amigos_proximos')}
              type="button"
              className={`px-3 py-1.5 rounded-full font-medium transition-all shrink-0 ${
                filterCategory === 'amigos_proximos'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50'
              }`}
            >
              Amigos
            </button>
          </div>
        </div>

        {/* Lista de Cards de Contatos */}
        {displayedContacts.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-sm">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">
              Nenhum contato nesta categoria!
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              {filterCategory === 'urgentes'
                ? 'Parabéns! Todas as suas conexões importantes estão com conversas em dia.'
                : 'Adicione novas pessoas ou selecione outro filtro para visualizar.'}
            </p>
            {contacts.length === 0 && (
              <button
                onClick={onOpenNewContactModal}
                type="button"
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700"
              >
                Cadastrar Primeiro Amigo
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedContacts.map(({ contact, scores }) => {
              const categoryConfig = CATEGORY_LABELS[contact.category] || CATEGORY_LABELS.conhecidos;
              const isNeglected = scores.status === 'negligenciado';
              const isIcebreakerOpen = expandedIcebreakerId === contact.id;

              return (
                <article
                  key={contact.id}
                  id={`contact-card-${contact.id}`}
                  className={`relative rounded-3xl p-5 transition-all bg-white border ${
                    isNeglected
                      ? 'border-rose-200 shadow-md shadow-rose-500/5 hover:border-rose-300 ring-1 ring-rose-100'
                      : scores.status === 'atencao'
                      ? 'border-amber-200 shadow-sm hover:border-amber-300'
                      : 'border-slate-200/80 shadow-sm hover:border-indigo-200'
                  }`}
                >
                  {/* Top row: Avatar + Name + Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0"
                        style={{ backgroundColor: contact.avatarColor || '#6366f1' }}
                      >
                        {contact.name.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onOpenContactDetail(contact.id)}
                            className="font-bold text-slate-900 hover:text-indigo-600 text-left transition-colors text-base"
                          >
                            {contact.name}
                          </button>
                          {contact.nickname && (
                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                              {contact.nickname}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${categoryConfig.badgeBg}`}
                          >
                            {categoryConfig.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <ScoreBadge type="status" value={scores.status} />
                  </div>

                  {/* Informações de Intervalo e Último Contato */}
                  <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Última conversa:
                      </span>
                      <span className="font-semibold text-slate-700">
                        {formatTimeAgo(scores.daysSinceLastInteraction)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Meta definida:</span>
                      <span className="text-slate-700 font-medium">
                        Falar a cada {contact.targetIntervalDays} dias
                        {scores.isOverdue && (
                          <span className="text-rose-600 font-bold ml-1.5">
                            ({scores.overdueDays}d em atraso)
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Barra de progresso do intervalo */}
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isNeglected
                            ? 'bg-rose-500'
                            : scores.status === 'atencao'
                            ? 'bg-amber-400'
                            : 'bg-emerald-500'
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            (scores.daysSinceLastInteraction / contact.targetIntervalDays) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Notas de Avaliação (Intimidade + Importância + Bem-estar) */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <ScoreBadge type="intimacy" value={scores.intimacyScore} size="sm" />
                    <ScoreBadge type="importance" value={contact.importanceRating} size="sm" />
                    <ScoreBadge type="wellbeing" value={contact.wellbeingRating} size="sm" />
                    {isNeglected && (
                      <ScoreBadge type="priority" value={scores.priorityScore} size="sm" />
                    )}
                  </div>

                  {/* Memória Social / Gancho Contextual da última conversa */}
                  {contact.interactions?.[0]?.nextTopicHook && (
                    <div className="mt-3 p-2.5 rounded-xl bg-amber-50/90 border border-amber-200/90 text-xs text-amber-900 flex items-start gap-2">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[10px] uppercase tracking-wider text-amber-800 block">
                          Lembre-se de perguntar:
                        </span>
                        <span className="font-medium italic text-slate-800">
                          “{contact.interactions[0].nextTopicHook}”
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Botões de Ação Imediata */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        id={`btn-log-${contact.id}`}
                        onClick={() => onOpenLogModal(contact.id)}
                        type="button"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold shadow-sm transition-all"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        Registrar Conversa
                      </button>

                      {onOpenScheduleModal && (
                        <button
                          type="button"
                          onClick={() => onOpenScheduleModal(contact)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-colors"
                          title="Agendar encontro / Google Calendar / .ICS"
                        >
                          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                          <span className="hidden sm:inline">Agendar</span>
                        </button>
                      )}

                      {contact.phone && (
                        <a
                          id={`btn-wa-${contact.id}`}
                          href={`https://wa.me/${contact.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition-colors"
                          title="Abrir WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedIcebreakerId(isIcebreakerOpen ? null : contact.id)
                        }
                        className={`p-1.5 rounded-xl border transition-colors ${
                          isIcebreakerOpen
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                        title="Ideias para quebrar o gelo"
                      >
                        <Lightbulb className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenContactDetail(contact.id)}
                        className="p-1.5 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors"
                        title="Ver histórico e perfil completo"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Icebreaker dropdown helper */}
                  {isIcebreakerOpen && (
                    <div className="mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs space-y-2 animate-fadeIn">
                      <div className="font-semibold text-amber-900 flex items-center gap-1">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                        Sugestões para retomar contato com {contact.name}:
                      </div>
                      <ul className="space-y-1.5 text-amber-800">
                        {ICEBREAKER_SUGGESTIONS.slice(0, 3).map((item, idx) => (
                          <li
                            key={idx}
                            onClick={() => {
                              if (navigator.clipboard) {
                                navigator.clipboard.writeText(item.replace(/[“”]/g, ''));
                                alert('Mensagem copiada para a área de transferência!');
                              }
                            }}
                            className="p-1.5 rounded-lg bg-white/80 border border-amber-100 cursor-pointer hover:bg-white hover:text-amber-950 transition-colors"
                            title="Clique para copiar"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                      <p className="text-[10px] text-amber-700/80">Toque em uma frase para copiar.</p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Dica para o usuário sobre o cálculo */}
      <section className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Como funciona o cálculo de intimidade e prioridade?</p>
          <p className="text-indigo-800/80 mt-0.5 leading-relaxed">
            A <strong>Nota de Intimidade</strong> é calculada automaticamente com base na frequência real e na qualidade média das suas conversas. A <strong>Prioridade de Negligência</strong> cruza o tempo de atraso com a nota de <strong>Importância</strong> e de <strong>Bem-estar</strong> atribuídas por você, garantindo que as pessoas que mais importam e fazem você se sentir bem nunca fiquem esquecidas.
          </p>
        </div>
      </section>
    </div>
  );
};

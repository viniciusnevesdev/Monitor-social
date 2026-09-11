import React from 'react';
import { Contact, Interaction } from '../types';
import { computeContactScores, formatTimeAgo, CATEGORY_LABELS, CHANNEL_CONFIG } from '../utils/calculations';
import { ScoreBadge } from './ScoreBadge';
import {
  X,
  Phone,
  MessageCircle,
  Calendar,
  Clock,
  Trash2,
  Edit2,
  PlusCircle,
  Sparkles,
  TrendingUp,
  Star,
  Heart,
  ChevronRight,
  MessageSquare,
  Lightbulb
} from 'lucide-react';

interface ContactDetailModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (contactId: string) => void;
  onOpenLogModal: (contactId: string) => void;
  onDeleteInteraction: (contactId: string, interactionId: string) => void;
  onOpenScheduleModal?: (contact: Contact) => void;
}

export const ContactDetailModal: React.FC<ContactDetailModalProps> = ({
  contact,
  isOpen,
  onClose,
  onEditContact,
  onDeleteContact,
  onOpenLogModal,
  onDeleteInteraction,
  onOpenScheduleModal,
}) => {
  if (!isOpen || !contact) return null;

  const scores = computeContactScores(contact);
  const cat = CATEGORY_LABELS[contact.category] || CATEGORY_LABELS.conhecidos;
  const interactions = contact.interactions || [];
  const sortedInteractions = [...interactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with profile hero */}
        <div className="relative p-6 bg-slate-50 border-b border-slate-100">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-md shrink-0"
              style={{ backgroundColor: contact.avatarColor || '#6366f1' }}
            >
              {contact.name.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 pr-6">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{contact.name}</h2>
                {contact.nickname && (
                  <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                    {contact.nickname}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${cat.badgeBg}`}>
                  {cat.label}
                </span>
                <ScoreBadge type="status" value={scores.status} size="sm" />
              </div>

              {contact.phone && (
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {contact.phone}
                </p>
              )}
            </div>
          </div>

          {/* Quick contact communication links */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-200/60">
            <button
              onClick={() => {
                onClose();
                onOpenLogModal(contact.id);
              }}
              type="button"
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Registrar Conversa
            </button>

            {onOpenScheduleModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenScheduleModal(contact);
                }}
                type="button"
                className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-all"
                title="Agendar encontro e exportar para Google Calendar / .ICS"
              >
                <Calendar className="w-4 h-4" />
                Agendar
              </button>
            )}

            {contact.phone && (
              <a
                href={`https://wa.me/${contact.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            )}

            <button
              onClick={() => {
                onClose();
                onEditContact(contact);
              }}
              type="button"
              className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
              title="Editar Contato"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>

          {/* Destaque da Memória Social / Gancho do próximo papo */}
          {sortedInteractions[0]?.nextTopicHook && (
            <div className="mt-3 p-3 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-2 text-xs text-amber-900">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-[11px] uppercase tracking-wider text-amber-800">
                  Lembrete para o próximo contato:
                </span>
                <p className="italic text-slate-800 mt-0.5 font-medium">
                  “{sortedInteractions[0].nextTopicHook}”
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Card com o Cálculo Transparente de Intimidade */}
          <section className="bg-gradient-to-br from-indigo-50/70 to-purple-50/50 rounded-2xl p-4 border border-indigo-100/80">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Índice de Intimidade Calculado
                </h3>
              </div>
              <span className="text-lg font-black text-indigo-700">
                {scores.intimacyScore}
                <span className="text-xs text-indigo-400 font-normal">/10</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-indigo-50">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Frequência (Cumprimento da Meta)
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {scores.frequencyScore}/10
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Última: {formatTimeAgo(scores.daysSinceLastInteraction)}
                </p>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-indigo-50">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Qualidade Média das Conversas
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {scores.avgQualityScore}/10
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {interactions.length} {interactions.length === 1 ? 'registro' : 'registros'}
                </p>
              </div>
            </div>
          </section>

          {/* Suas Avaliações Subjetivas */}
          <section className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Suas Notas Pessoais
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-100">
                <div className="flex items-center gap-1.5 text-amber-900 text-xs font-semibold">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  Importância na sua vida
                </div>
                <div className="text-xl font-bold text-amber-800 mt-1">
                  {contact.importanceRating}/10
                </div>
              </div>

              <div className="p-3 bg-rose-50/60 rounded-2xl border border-rose-100">
                <div className="flex items-center gap-1.5 text-rose-900 text-xs font-semibold">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-400" />
                  O quanto faz você se sentir bem
                </div>
                <div className="text-xl font-bold text-rose-800 mt-1">
                  {contact.wellbeingRating}/10
                </div>
              </div>
            </div>
          </section>

          {/* Meta & Lembretes */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 block">Meta de Frequência</span>
              <span className="font-semibold text-slate-800">
                Conversar a cada {contact.targetIntervalDays} dias
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">Lembretes automáticos</span>
              <span className={`font-semibold ${contact.reminderEnabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                {contact.reminderEnabled ? 'Ativados' : 'Desativados'}
              </span>
            </div>
          </div>

          {/* Notas Pessoais */}
          {contact.notes && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <span className="font-semibold text-slate-700 block mb-1">Notas & Contexto:</span>
              <p className="text-slate-600 whitespace-pre-wrap">{contact.notes}</p>
            </div>
          )}

          {/* Histórico de Conversas */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                Histórico de Conversas ({sortedInteractions.length})
              </h3>
            </div>

            {sortedInteractions.length === 0 ? (
              <div className="p-6 text-center rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                Nenhuma interação registrada ainda.
                <button
                  onClick={() => {
                    onClose();
                    onOpenLogModal(contact.id);
                  }}
                  className="block mx-auto mt-2 text-indigo-600 font-semibold hover:underline"
                >
                  Registrar primeira conversa
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {sortedInteractions.map((int) => {
                  const channelInfo = CHANNEL_CONFIG[int.channel] || { label: int.channel };

                  return (
                    <div
                      key={int.id}
                      className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800">
                              {channelInfo.label}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {int.date}
                            </span>
                            {int.durationMinutes && (
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                {int.durationMinutes} min
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-[10px] text-slate-400">Qualidade:</span>
                            <span className="text-xs font-bold text-indigo-600">
                              {int.quality}/10
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (confirm('Tem certeza que deseja apagar esta interação do histórico?')) {
                              onDeleteInteraction(contact.id, int.id);
                            }
                          }}
                          className="p-1 rounded-md text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                          title="Excluir conversa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {int.summary && (
                        <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded-xl">
                          {int.summary}
                        </p>
                      )}

                      {int.nextTopicHook && (
                        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200">
                          <Lightbulb className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>Gancho salvo: <em>“{int.nextTopicHook}”</em></span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Delete Contact Button */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => {
                if (
                  confirm(
                    `Tem certeza que deseja remover ${contact.name} do seu monitor de relações? Todas as notas e históricos serão apagados.`
                  )
                ) {
                  onDeleteContact(contact.id);
                  onClose();
                }
              }}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition-colors font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remover este contato
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

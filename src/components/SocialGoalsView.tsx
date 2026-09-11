import React, { useState } from 'react';
import { Contact, SocialGoal } from '../types';
import { computeContactScores, formatTimeAgo, CATEGORY_LABELS } from '../utils/calculations';
import {
  Target,
  CheckCircle2,
  Calendar,
  Bell,
  Sparkles,
  ArrowRight,
  Flame,
  Award,
  Plus,
  Send
} from 'lucide-react';

interface SocialGoalsViewProps {
  contacts: Contact[];
  onOpenLogModal: (contactId?: string) => void;
  onOpenContactDetail: (contactId: string) => void;
}

export const SocialGoalsView: React.FC<SocialGoalsViewProps> = ({
  contacts,
  onOpenLogModal,
  onOpenContactDetail,
}) => {
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);

  // Calcular contatos e lembretes
  const contactsWithScores = contacts.map((contact) => ({
    contact,
    scores: computeContactScores(contact),
  }));

  // Metas sociais dinâmicas calculadas
  const overdueContacts = contactsWithScores.filter((c) => c.scores.isOverdue);
  const upToDateContacts = contactsWithScores.filter((c) => c.scores.status === 'em_dia');
  const highPriorityNeglected = contactsWithScores.filter(
    (c) => c.scores.status === 'negligenciado' && c.contact.importanceRating >= 8
  );

  // Lembretes automáticos ativos ordenados pelos que vencem primeiro ou já venceram
  const reminderContacts = contactsWithScores
    .filter((c) => c.contact.reminderEnabled)
    .sort((a, b) => b.scores.priorityScore - a.scores.priorityScore);

  // Disparar notificação de teste ou checar permissão
  const handleTestNotification = async () => {
    if (!('Notification' in window)) {
      setNotificationStatus('Seu navegador não tem suporte a notificações web.');
      return;
    }

    try {
      let permission = Notification.permission;
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

      if (permission === 'granted') {
        const topNeglected = highPriorityNeglected[0] || overdueContacts[0];
        const title = topNeglected
          ? `Lembrete Social: Falar com ${topNeglected.contact.name}`
          : 'Lembrete Social: Conexões em Dia!';
        const body = topNeglected
          ? `Faz ${topNeglected.scores.daysSinceLastInteraction} dias que você não conversa. Meta: a cada ${topNeglected.contact.targetIntervalDays} dias.`
          : 'Todas as suas conexões prioritárias estão atualizadas.';

        new Notification(title, {
          body,
          icon: '/icon.svg',
          badge: '/icon.svg',
        });
        setNotificationStatus('Notificação de teste enviada com sucesso!');
      } else {
        setNotificationStatus('Permissão para notificações não foi concedida.');
      }
    } catch (err) {
      setNotificationStatus('Erro ao enviar notificação.');
    }
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-600" />
            Metas & Lembretes Sociais
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Acompanhe o cumprimento das suas metas de convivência e mantenha laços saudáveis.
          </p>
        </div>

        <button
          onClick={handleTestNotification}
          type="button"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
        >
          <Bell className="w-3.5 h-3.5 text-amber-300" />
          Testar Lembrete Web
        </button>
      </div>

      {notificationStatus && (
        <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-center justify-between">
          <span>{notificationStatus}</span>
          <button
            onClick={() => setNotificationStatus(null)}
            className="text-xs text-indigo-600 hover:underline font-bold"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Cards de Metas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Meta 1 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Meta Semanal
            </span>
            <Flame className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mt-2">
            Reconectar com Negligenciados
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Reduzir contatos em atraso falando com pessoas prioritárias.
          </p>

          <div className="mt-4">
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-600">Em dia vs Atrasados</span>
              <span className="text-indigo-600">
                {upToDateContacts.length} de {contacts.length}
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${
                    contacts.length > 0
                      ? (upToDateContacts.length / contacts.length) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Meta 2 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-pink-600 uppercase tracking-wider">
              Pilar Família & Amigos
            </span>
            <Award className="w-5 h-5 text-pink-500" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mt-2">
            Laços de Alta Importância
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Pessoas com nota de importância ≥ 8 na sua vida.
          </p>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-slate-900">
                {highPriorityNeglected.length === 0 ? 'Tudo em dia!' : `${highPriorityNeglected.length} pendentes`}
              </span>
              <span className="block text-[11px] text-slate-400">
                {highPriorityNeglected.length === 0
                  ? 'Nenhum pilar familiar atrasado'
                  : 'Necessitam de reconexão prioritária'}
              </span>
            </div>
          </div>
        </div>

        {/* Meta 3 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Qualidade Emocional
            </span>
            <Sparkles className="w-5 h-5 text-emerald-500" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mt-2">
            Fator de Bem-Estar Médio
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Média da nota de bem-estar das pessoas do seu convívio.
          </p>

          <div className="mt-4">
            <div className="text-2xl font-bold text-slate-900">
              {contacts.length > 0
                ? (
                    contacts.reduce((acc, c) => acc + c.wellbeingRating, 0) /
                    contacts.length
                  ).toFixed(1)
                : '0.0'}
              <span className="text-sm font-normal text-slate-400"> / 10</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-medium">
              Rede de apoio de alto impacto positivo
            </span>
          </div>
        </div>
      </div>

      {/* Lembretes Automáticos Ativos */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-600" />
              Lembretes Automáticos Programados
            </h2>
            <p className="text-xs text-slate-500">
              O sistema calcula o vencimento com base na frequência ideal cadastrada para cada pessoa.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {reminderContacts.map(({ contact, scores }) => {
            const isDueOrOverdue = scores.isOverdue;
            const daysLeft = contact.targetIntervalDays - scores.daysSinceLastInteraction;

            return (
              <div
                key={contact.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ backgroundColor: contact.avatarColor || '#6366f1' }}
                  >
                    {contact.name.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <button
                      onClick={() => onOpenContactDetail(contact.id)}
                      className="font-bold text-slate-900 hover:text-indigo-600 text-sm text-left transition-colors"
                    >
                      {contact.name}
                      {contact.nickname && ` (${contact.nickname})`}
                    </button>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>Meta: a cada {contact.targetIntervalDays}d</span>
                      <span>•</span>
                      <span>Última vez: {formatTimeAgo(scores.daysSinceLastInteraction)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      isDueOrOverdue
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : daysLeft <= 2
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {isDueOrOverdue
                      ? `Atrasado há ${scores.overdueDays}d`
                      : daysLeft === 0
                      ? 'Vence hoje!'
                      : `Faltam ${daysLeft}d`}
                  </span>

                  <button
                    onClick={() => onOpenLogModal(contact.id)}
                    type="button"
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-xs"
                  >
                    Registrar
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

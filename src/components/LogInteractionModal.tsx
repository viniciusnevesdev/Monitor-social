import React, { useState } from 'react';
import { Contact, InteractionChannel } from '../types';
import { CHANNEL_CONFIG } from '../utils/calculations';
import { X, Calendar, Star, MessageCircle, Phone, Users, Coffee, Video, Mail, Check, Lightbulb } from 'lucide-react';

interface LogInteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  initialContactId?: string;
  onSaveInteraction: (
    contactId: string,
    interaction: {
      date: string;
      channel: InteractionChannel;
      quality: number;
      durationMinutes?: number;
      summary: string;
      topicsDiscussed?: string;
      nextTopicHook?: string;
    }
  ) => void;
}

export const LogInteractionModal: React.FC<LogInteractionModalProps> = ({
  isOpen,
  onClose,
  contacts,
  initialContactId,
  onSaveInteraction,
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedContactId, setSelectedContactId] = useState<string>(
    initialContactId || (contacts[0]?.id ?? '')
  );
  const [date, setDate] = useState<string>(todayStr);
  const [channel, setChannel] = useState<InteractionChannel>('whatsapp');
  const [quality, setQuality] = useState<number>(8);
  const [durationMinutes, setDurationMinutes] = useState<string>('20');
  const [summary, setSummary] = useState<string>('');
  const [nextTopicHook, setNextTopicHook] = useState<string>('');

  const channelIcons: Record<string, any> = {
    whatsapp: MessageCircle,
    ligacao: Phone,
    presencial: Users,
    cafe: Coffee,
    videochamada: Video,
    mensagem: Mail,
  };

  const getQualityDescription = (q: number) => {
    if (q >= 9) return 'Conversa profunda, marcante e muito enriquecedora';
    if (q >= 7) return 'Conversa boa, fluida e calorosa';
    if (q >= 5) return 'Conversa agradável, tópicos casuais';
    if (q >= 3) return 'Contato rápido ou protocolar';
    return 'Conversa fria, tensa ou truncada';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContactId) return;

    onSaveInteraction(selectedContactId, {
      date,
      channel,
      quality,
      durationMinutes: durationMinutes ? parseInt(durationMinutes, 10) : undefined,
      summary: summary.trim() || 'Conversa rápida registrada',
      nextTopicHook: nextTopicHook.trim() || undefined,
    });

    onClose();
  };

  const selectedPerson = contacts.find((c) => c.id === selectedContactId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Registrar Conversa</h2>
            <p className="text-xs text-slate-500">
              Atualize seu histórico e o índice de intimidade deste relacionamento.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Selecionar contato */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Com quem você conversou?
            </label>
            <select
              value={selectedContactId}
              onChange={(e) => setSelectedContactId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.nickname ? `(${c.nickname})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Data e Duração */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Data
              </label>
              <input
                type="date"
                value={date}
                max={todayStr}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <div className="flex gap-1.5 mt-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setDate(todayStr)}
                  className="text-indigo-600 hover:underline font-medium"
                >
                  Hoje
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={() => {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    setDate(yesterday.toISOString().split('T')[0]);
                  }}
                  className="text-indigo-600 hover:underline font-medium"
                >
                  Ontem
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Duração aprox. (minutos)
              </label>
              <input
                type="number"
                min="1"
                max="600"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                placeholder="Ex: 20"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Canal de Comunicação */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Canal da Interação
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {Object.entries(CHANNEL_CONFIG).map(([key, config]) => {
                const IconComponent = channelIcons[key] || MessageCircle;
                const isSelected = channel === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setChannel(key as InteractionChannel)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-semibold shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mb-1" />
                    <span className="text-[10px] line-clamp-1">{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slider de Qualidade da Conversa (1 a 10) */}
          <div className="p-3.5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                Qualidade da Comunicação:
              </label>
              <span className="text-sm font-extrabold text-indigo-700 bg-white px-2.5 py-0.5 rounded-lg border border-indigo-200 shadow-xs">
                {quality}/10
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              {getQualityDescription(quality)}
            </p>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={quality}
              onChange={(e) => setQuality(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>1 (Fria/Superficial)</span>
              <span>5 (Normal)</span>
              <span>10 (Profunda & Marcante)</span>
            </div>
          </div>

          {/* Resumo ou Assunto da Conversa */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Assunto ou notas da conversa (opcional)
            </label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Ex: Falamos sobre trabalho, viagens e combinamos de nos ver no fim de semana..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
            />
          </div>

          {/* Memória Social: Gancho para a próxima conversa */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-1.5">
            <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              Memória Social: O que perguntar na próxima conversa?
            </label>
            <p className="text-[11px] text-amber-700/90 leading-tight">
              Anote um detalhe importante para puxar assunto no próximo lembrete (ex: entrevista, exame médico, viagem).
            </p>
            <input
              type="text"
              value={nextTopicHook}
              onChange={(e) => setNextTopicHook(e.target.value)}
              placeholder="Ex: Perguntar se a viagem a trabalho correu bem..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-amber-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-slate-400 font-medium"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium text-xs transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" />
              Salvar e Atualizar Intimidade
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

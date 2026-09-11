import React, { useState } from 'react';
import { Contact } from '../types';
import { generateGoogleCalendarUrl, downloadIcsFile } from '../utils/integrations';
import {
  X,
  Calendar,
  Clock,
  Coffee,
  Phone,
  Video,
  Users,
  Download,
  ExternalLink,
  Check
} from 'lucide-react';

interface ScheduleMeetModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ScheduleMeetModal: React.FC<ScheduleMeetModalProps> = ({
  contact,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !contact) return null;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [date, setDate] = useState<string>(tomorrowStr);
  const [time, setTime] = useState<string>('16:00');
  const [type, setType] = useState<string>('Café');
  const [notes, setNotes] = useState<string>('');
  const [scheduledSuccess, setScheduledSuccess] = useState<string | null>(null);

  const meetTypes = [
    { label: 'Café', icon: Coffee },
    { label: 'Almoço', icon: Coffee },
    { label: 'Ligação', icon: Phone },
    { label: 'Vídeo', icon: Video },
    { label: 'Encontro', icon: Users },
  ];

  const handleGoogleCalendar = () => {
    const url = generateGoogleCalendarUrl({
      name: contact.name,
      type,
      date,
      time,
      notes,
    });
    window.open(url, '_blank');
    setScheduledSuccess('Abrindo Google Calendar...');
    setTimeout(() => {
      setScheduledSuccess(null);
      onClose();
    }, 1500);
  };

  const handleDownloadIcs = () => {
    downloadIcsFile({
      name: contact.name,
      type,
      date,
      time,
      notes,
    });
    setScheduledSuccess('Arquivo .ICS baixado para seu calendário!');
    setTimeout(() => {
      setScheduledSuccess(null);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Agendar Encontro ou Ligação
            </h2>
            <p className="text-xs text-slate-500">
              Planeje um reencontro com {contact.name} e integre com sua agenda.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {scheduledSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              {scheduledSuccess}
            </div>
          )}

          {/* Tipo de Encontro */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tipo de Compromisso
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {meetTypes.map((item) => {
                const Icon = item.icon;
                const isSelected = type === item.label;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setType(item.label)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span className="text-[10px]">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Data e Horário */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Data
              </label>
              <input
                type="date"
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Horário
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Assuntos ou Pauta */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pauta ou assunto a tratar (opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Alinhamento de ideias, comemorar aniversário..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Botões de Integração com Calendários */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <button
              onClick={handleGoogleCalendar}
              type="button"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              Adicionar no Google Calendar
            </button>

            <button
              onClick={handleDownloadIcs}
              type="button"
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              Baixar Arquivo .ICS (Apple Calendar / Outlook)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

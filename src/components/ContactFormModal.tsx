import React, { useEffect, useState } from 'react';
import { Contact, ContactCategory } from '../types';
import { CATEGORY_LABELS } from '../utils/calculations';
import { X, Heart, Star, Clock, Bell, User, Phone, Check } from '../icons';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveContact: (contactData: Partial<Contact>) => void;
  contactToEdit?: Contact | null;
}

const AVATAR_COLORS = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#0ea5e9', // Sky
  '#10b981', // Emerald
  '#8b5cf6', // Purple
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#06b6d4', // Cyan
];

const MAX_AVATAR_FILE_SIZE = 20 * 1024 * 1024;
const AVATAR_OUTPUT_SIZE = 320;

function compressAvatarPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Escolha um arquivo de imagem.'));
      return;
    }

    if (file.size > MAX_AVATAR_FILE_SIZE) {
      reject(new Error('A foto é muito grande. Escolha uma imagem de até 20 MB.'));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      try {
        const side = Math.min(image.naturalWidth, image.naturalHeight);
        if (!side) throw new Error('Não foi possível ler as dimensões da foto.');

        const outputSize = Math.min(AVATAR_OUTPUT_SIZE, side);
        const canvas = document.createElement('canvas');
        canvas.width = outputSize;
        canvas.height = outputSize;

        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Não foi possível preparar a foto.');

        const sourceX = (image.naturalWidth - side) / 2;
        const sourceY = (image.naturalHeight - side) / 2;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, outputSize, outputSize);
        ctx.drawImage(
          image,
          sourceX,
          sourceY,
          side,
          side,
          0,
          0,
          outputSize,
          outputSize
        );

        resolve(canvas.toDataURL('image/jpeg', 0.76));
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Não foi possível processar a foto.'));
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Não foi possível abrir essa foto.'));
    };

    image.src = objectUrl;
  });
}

export const ContactFormModal: React.FC<ContactFormModalProps> = ({
  isOpen,
  onClose,
  onSaveContact,
  contactToEdit,
}) => {
  const [name, setName] = useState(contactToEdit?.name || '');
  const [nickname, setNickname] = useState(contactToEdit?.nickname || '');
  const [phone, setPhone] = useState(contactToEdit?.phone || '');
  const [category, setCategory] = useState<ContactCategory>(
    contactToEdit?.category || 'amigos_proximos'
  );
  const [avatarColor, setAvatarColor] = useState(
    contactToEdit?.avatarColor || AVATAR_COLORS[0]
  );
  const [avatarImage, setAvatarImage] = useState(contactToEdit?.avatarImage || '');
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarProcessing, setAvatarProcessing] = useState(false);
  const [importanceRating, setImportanceRating] = useState<number>(
    contactToEdit?.importanceRating ?? 8
  );
  const [wellbeingRating, setWellbeingRating] = useState<number>(
    contactToEdit?.wellbeingRating ?? 8
  );
  const [targetIntervalDays, setTargetIntervalDays] = useState<number>(
    contactToEdit?.targetIntervalDays ?? 7
  );
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(
    contactToEdit?.reminderEnabled ?? true
  );
  const [notes, setNotes] = useState(contactToEdit?.notes || '');

  useEffect(() => {
    if (!isOpen) return;

    setName(contactToEdit?.name || '');
    setNickname(contactToEdit?.nickname || '');
    setPhone(contactToEdit?.phone || '');
    setCategory(contactToEdit?.category || 'amigos_proximos');
    setAvatarColor(contactToEdit?.avatarColor || AVATAR_COLORS[0]);
    setAvatarImage(contactToEdit?.avatarImage || '');
    setImportanceRating(contactToEdit?.importanceRating ?? 8);
    setWellbeingRating(contactToEdit?.wellbeingRating ?? 8);
    setTargetIntervalDays(contactToEdit?.targetIntervalDays ?? 7);
    setReminderEnabled(contactToEdit?.reminderEnabled ?? true);
    setNotes(contactToEdit?.notes || '');
    setAvatarError(null);
    setAvatarProcessing(false);
  }, [isOpen, contactToEdit]);

  if (!isOpen) return null;

  const handleAvatarFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setAvatarProcessing(true);
    setAvatarError(null);
    try {
      const compressed = await compressAvatarPhoto(file);
      setAvatarImage(compressed);
    } catch (error) {
      setAvatarError(error instanceof Error ? error.message : 'Não foi possível processar a foto.');
    } finally {
      setAvatarProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSaveContact({
      id: contactToEdit?.id,
      name: name.trim(),
      nickname: nickname.trim() || undefined,
      phone: phone.trim() || undefined,
      category,
      avatarColor,
      avatarImage: avatarImage || undefined,
      importanceRating,
      wellbeingRating,
      targetIntervalDays,
      reminderEnabled,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  const getImportanceLabel = (val: number) => {
    if (val >= 9) return 'Pilar fundamental na minha vida (Prioridade máxima)';
    if (val >= 7) return 'Muito importante para o meu dia a dia e futuro';
    if (val >= 5) return 'Importante, valorizo bastante a relação';
    return 'Conexão casual ou pontual';
  };

  const getWellbeingLabel = (val: number) => {
    if (val >= 9) return 'Sensação incrível! Me energiza e faz muito bem';
    if (val >= 7) return 'Conversas leves, reconfortantes e alegres';
    if (val >= 5) return 'Sensação neutra / agradável';
    return 'Relação às vezes desgastante ou formal';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {contactToEdit ? 'Editar Amigo ou Conexão' : 'Nova Pessoa'}
            </h2>
            <p className="text-xs text-slate-500">
              Defina suas notas pessoais e a frequência desejada de contato.
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
          {/* Nome e Apelido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome completo *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Lucas Brandão"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Apelido ou Como chamo
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Ex: Lukinha, Mãe..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Categoria e Telefone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Categoria da Relação
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ContactCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {Object.entries(CATEGORY_LABELS).map(([key, cfg]) => (
                  <option key={key} value={key}>
                    {cfg.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                Telefone / WhatsApp
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+55 11 99999-9999"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Foto e cor de identificação */}
          <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-800">
                Foto da pessoa
              </label>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Opcional. A foto é recortada em quadrado e comprimida automaticamente para ocupar menos espaço.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center text-white text-xl font-extrabold shadow-sm shrink-0"
                style={{ backgroundColor: avatarColor }}
              >
                {avatarImage ? (
                  <img src={avatarImage} alt="Prévia da foto" className="w-full h-full object-cover" />
                ) : (
                  <span>{(name.trim().charAt(0) || '?').toUpperCase()}</span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <label className="inline-flex items-center justify-center px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer transition-colors">
                  {avatarProcessing ? 'Processando...' : avatarImage ? 'Alterar foto' : 'Escolher foto'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFile}
                    disabled={avatarProcessing}
                    className="hidden"
                  />
                </label>

                {avatarImage && (
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarImage('');
                      setAvatarError(null);
                    }}
                    className="px-3 py-2 rounded-xl border border-rose-200 bg-white text-rose-700 text-xs font-bold hover:bg-rose-50 transition-colors"
                  >
                    Remover foto
                  </button>
                )}
              </div>
            </div>

            {avatarError && (
              <p className="text-[11px] font-semibold text-rose-600">{avatarError}</p>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                Cor usada quando não houver foto
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {AVATAR_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setAvatarColor(color)}
                    aria-label={`Usar cor ${color}`}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      avatarColor === color
                        ? 'scale-125 ring-2 ring-offset-2 ring-slate-900'
                        : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* NOTA 1: IMPORTÂNCIA NA MINHA VIDA (1 a 10) */}
          <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200/80">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                Sua Nota de Importância na sua vida:
              </label>
              <span className="text-sm font-extrabold text-amber-800 bg-white px-2.5 py-0.5 rounded-lg border border-amber-200 shadow-xs">
                {importanceRating}/10
              </span>
            </div>
            <p className="text-[11px] text-amber-800/80 mb-2">
              {getImportanceLabel(importanceRating)}
            </p>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={importanceRating}
              onChange={(e) => setImportanceRating(parseInt(e.target.value, 10))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* NOTA 2: O QUANTO ESSA PESSOA FAZ EU ME SENTIR BEM (1 a 10) */}
          <div className="p-3.5 bg-rose-50/50 rounded-2xl border border-rose-200/80">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-400" />
                O quanto essa pessoa faz você se sentir bem:
              </label>
              <span className="text-sm font-extrabold text-rose-700 bg-white px-2.5 py-0.5 rounded-lg border border-rose-200 shadow-xs">
                {wellbeingRating}/10
              </span>
            </div>
            <p className="text-[11px] text-rose-800/80 mb-2">
              {getWellbeingLabel(wellbeingRating)}
            </p>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={wellbeingRating}
              onChange={(e) => setWellbeingRating(parseInt(e.target.value, 10))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

          {/* META DE FREQUÊNCIA & LEMBRETES */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  Meta de Frequência de Contato:
                </label>
                <span className="text-xs font-bold text-indigo-700">
                  A cada {targetIntervalDays} {targetIntervalDays === 1 ? 'dia' : 'dias'}
                </span>
              </div>

              {/* Quick Preset buttons */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  { days: 3, label: '3 dias' },
                  { days: 7, label: 'Semanal (7d)' },
                  { days: 14, label: 'Quinzenal (14d)' },
                  { days: 30, label: 'Mensal (30d)' },
                  { days: 60, label: 'Bimestral (60d)' },
                ].map((preset) => (
                  <button
                    key={preset.days}
                    type="button"
                    onClick={() => setTargetIntervalDays(preset.days)}
                    className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition-colors ${
                      targetIntervalDays === preset.days
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Switch de Lembretes Automáticos */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600" />
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">
                    Lembretes Automáticos
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Avisar quando a meta de contato estiver perto de vencer
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
              />
            </div>
          </div>

          {/* Notas Pessoais */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notas e preferências pessoais (opcional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Gosta de trilhas, aniversário em outubro, prefere ligação à noite..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
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
              {contactToEdit ? 'Salvar Alterações' : 'Cadastrar Amigo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

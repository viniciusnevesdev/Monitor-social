import React, { useState } from 'react';
import { Contact } from '../types';
import { computeContactScores, formatTimeAgo, CATEGORY_LABELS } from '../utils/calculations';
import { ScoreBadge } from './ScoreBadge';
import {
  Search,
  Plus,
  SlidersHorizontal,
  ArrowUpDown,
  Phone,
  MessageSquare,
  Sparkles,
  Calendar,
  AlertTriangle,
  Upload,
  Smartphone
} from '../icons';
import { RadarCardLayout } from '../utils/radarLayout';
import { RadarContactCard } from './RadarContactCard';
import { RadarLayoutEditor } from './RadarLayoutEditor';

interface ContactsListProps {
  contacts: Contact[];
  onSelectContact: (contactId: string) => void;
  onOpenNewContactModal: () => void;
  onOpenLogModal: (contactId?: string) => void;
  onOpenScheduleModal: (contact: Contact) => void;
  onOpenImportModal?: () => void;
  radarLayout: RadarCardLayout;
  onRadarLayoutChange: (layout: RadarCardLayout) => void;
}

export const ContactsList: React.FC<ContactsListProps> = ({
  contacts,
  onSelectContact,
  onOpenNewContactModal,
  onOpenLogModal,
  onOpenScheduleModal,
  onOpenImportModal,
  radarLayout,
  onRadarLayoutChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [sortBy, setSortBy] = useState<
    'priority' | 'intimacy' | 'importance' | 'wellbeing' | 'name' | 'lastContact'
  >('priority');
  const [isRadarEditorOpen, setIsRadarEditorOpen] = useState(false);

  const contactsWithScores = contacts.map((contact) => ({
    contact,
    scores: computeContactScores(contact),
  }));

  // Filtragem
  const filtered = contactsWithScores.filter(({ contact }) => {
    const matchesCategory =
      selectedCategory === 'todos' || contact.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      contact.name.toLowerCase().includes(query) ||
      (contact.nickname && contact.nickname.toLowerCase().includes(query)) ||
      (contact.notes && contact.notes.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  // Ordenação
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'priority') {
      return b.scores.priorityScore - a.scores.priorityScore;
    }
    if (sortBy === 'intimacy') {
      return b.scores.intimacyScore - a.scores.intimacyScore;
    }
    if (sortBy === 'importance') {
      return b.contact.importanceRating - a.contact.importanceRating;
    }
    if (sortBy === 'wellbeing') {
      return b.contact.wellbeingRating - a.contact.wellbeingRating;
    }
    if (sortBy === 'name') {
      return a.contact.name.localeCompare(b.contact.name);
    }
    if (sortBy === 'lastContact') {
      return a.scores.daysSinceLastInteraction - b.scores.daysSinceLastInteraction;
    }
    return 0;
  });

  return (
    <div className="space-y-5 pb-28">
      {/* Header & New Contact button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Círculo de Conexões
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {contacts.length} {contacts.length === 1 ? 'pessoa cadastrada' : 'pessoas cadastradas'} com notas e metas
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsRadarEditorOpen(true)}
            type="button"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Editar cartões
          </button>
          {onOpenImportModal && (
            <button
              onClick={onOpenImportModal}
              type="button"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs border border-indigo-200 transition-colors"
            >
              <Smartphone className="w-4 h-4" />
              Importar Agenda
            </button>
          )}

          <button
            id="btn-add-contact"
            onClick={onOpenNewContactModal}
            type="button"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Adicionar Pessoa
          </button>
        </div>
      </div>

      {/* Search & Sorting bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-contacts-input"
            type="text"
            placeholder="Buscar por nome, apelido ou notas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 placeholder-slate-400 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
          {/* Categorias */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('todos')}
              type="button"
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                selectedCategory === 'todos'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Todos
            </button>
            {Object.entries(CATEGORY_LABELS).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                type="button"
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === key
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cfg.label}
              </button>
            ))}
          </div>

          {/* Ordenar por */}
          <div className="flex items-center gap-1.5 text-slate-500">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium cursor-pointer"
            >
              <option value="priority">Mais Negligenciados</option>
              <option value="intimacy">Maior Intimidade</option>
              <option value="importance">Maior Importância</option>
              <option value="wellbeing">Maior Bem-Estar</option>
              <option value="lastContact">Último Contato</option>
              <option value="name">Nome (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid de Contatos */}
      {sorted.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 text-slate-500 space-y-2">
          <p className="font-semibold text-slate-700">Nenhuma pessoa encontrada</p>
          <p className="text-xs text-slate-400">
            {searchQuery
              ? 'Tente buscar com outro termo ou limpe o filtro.'
              : 'Clique em "Adicionar Pessoa" para começar a monitorar.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {sorted.map(({ contact, scores }) => (
            <RadarContactCard
              key={contact.id}
              contact={contact}
              scores={scores}
              layout={radarLayout}
              onSelectContact={() => onSelectContact(contact.id)}
              onOpenLogModal={() => onOpenLogModal(contact.id)}
              onOpenScheduleModal={() => onOpenScheduleModal(contact)}
            />
          ))}
        </div>
      )}

      {isRadarEditorOpen && contacts[0] && (
        <RadarLayoutEditor
          contact={contacts[0]}
          initialLayout={radarLayout}
          onChange={onRadarLayoutChange}
          onClose={() => setIsRadarEditorOpen(false)}
        />
      )}
    </div>
  );
};

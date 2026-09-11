import React, { useState, useEffect } from 'react';
import { Contact, InteractionChannel } from './types';
import { INITIAL_CONTACTS } from './data/seedContacts';
import { computeContactScores } from './utils/calculations';
import { BottomNavBar, TabType } from './components/BottomNavBar';
import { NeglectedDashboard } from './components/NeglectedDashboard';
import { ContactsList } from './components/ContactsList';
import { SocialGoalsView } from './components/SocialGoalsView';
import { SettingsView } from './components/SettingsView';
import { ContactFormModal } from './components/ContactFormModal';
import { ContactDetailModal } from './components/ContactDetailModal';
import { LogInteractionModal } from './components/LogInteractionModal';
import { ScheduleMeetModal } from './components/ScheduleMeetModal';
import { ImportContactsModal } from './components/ImportContactsModal';
import { Bell, Sparkles, Heart } from 'lucide-react';

const STORAGE_KEY = 'social_sync_contacts_v1';

export default function App() {
  // 1. Estado dos Contatos com persistência em localStorage
  const [contacts, setContacts] = useState<Contact[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar contatos do localStorage, usando dados padrão:', e);
    }
    return INITIAL_CONTACTS;
  });

  // Salvar no localStorage sempre que houver alteração
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
    } catch (e) {
      console.error('Erro ao salvar no localStorage:', e);
    }
  }, [contacts]);

  // 2. Navegação por abas
  const [currentTab, setCurrentTab] = useState<TabType>('painel');

  // 3. Modais
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logModalContactId, setLogModalContactId] = useState<string | undefined>();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);

  const [selectedContactDetailId, setSelectedContactDetailId] = useState<string | null>(null);

  // Modais de Agendamento e Importação da Agenda
  const [scheduleContact, setScheduleContact] = useState<Contact | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // 4. Suporte PWA para instalação
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsPwaInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsPwaInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsPwaInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert(
        'Para instalar este PWA no seu dispositivo:\n• No Android/Chrome: Toque no menu (⋮) e em "Adicionar à tela inicial" ou "Instalar app".\n• No iPhone/Safari: Toque no botão de Compartilhar e selecione "Adicionar à Tela de Início".'
      );
    }
  };

  // 5. Handlers de Dados
  // Salvar nova interação
  const handleSaveInteraction = (
    contactId: string,
    interactionData: {
      date: string;
      channel: InteractionChannel;
      quality: number;
      durationMinutes?: number;
      summary: string;
      topicsDiscussed?: string;
      nextTopicHook?: string;
    }
  ) => {
    setContacts((prev) =>
      prev.map((contact) => {
        if (contact.id !== contactId) return contact;

        const newInteraction = {
          id: 'int-' + Date.now(),
          contactId,
          ...interactionData,
          createdAt: new Date().toISOString(),
        };

        const existing = contact.interactions || [];
        return {
          ...contact,
          interactions: [newInteraction, ...existing],
        };
      })
    );
  };

  // Importar contatos da agenda nativa / vCard
  const handleImportDeviceContacts = (importedList: Partial<Contact>[]) => {
    const newContacts: Contact[] = importedList.map((item, idx) => ({
      id: 'contact-' + Date.now() + '-' + idx,
      name: item.name || 'Sem nome',
      nickname: item.nickname,
      avatarColor: item.avatarColor || ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'][idx % 5],
      phone: item.phone,
      email: item.email,
      category: item.category || 'amigos_proximos',
      importanceRating: item.importanceRating ?? 8,
      wellbeingRating: item.wellbeingRating ?? 8,
      targetIntervalDays: item.targetIntervalDays ?? 14,
      reminderEnabled: item.reminderEnabled ?? true,
      notes: item.notes || 'Importado da agenda',
      interactions: [],
      createdAt: new Date().toISOString().split('T')[0],
    }));

    setContacts((prev) => [...newContacts, ...prev]);
  };

  // Excluir interação
  const handleDeleteInteraction = (contactId: string, interactionId: string) => {
    setContacts((prev) =>
      prev.map((contact) => {
        if (contact.id !== contactId) return contact;
        return {
          ...contact,
          interactions: (contact.interactions || []).filter((i) => i.id !== interactionId),
        };
      })
    );
  };

  // Salvar ou criar contato
  const handleSaveContact = (contactData: Partial<Contact>) => {
    if (contactData.id) {
      // Editar existente
      setContacts((prev) =>
        prev.map((c) => (c.id === contactData.id ? ({ ...c, ...contactData } as Contact) : c))
      );
    } else {
      // Criar novo
      const newContact: Contact = {
        id: 'contact-' + Date.now(),
        name: contactData.name || 'Sem nome',
        nickname: contactData.nickname,
        avatarColor: contactData.avatarColor || '#6366f1',
        phone: contactData.phone,
        email: contactData.email,
        category: contactData.category || 'amigos_proximos',
        importanceRating: contactData.importanceRating ?? 8,
        wellbeingRating: contactData.wellbeingRating ?? 8,
        targetIntervalDays: contactData.targetIntervalDays ?? 7,
        reminderEnabled: contactData.reminderEnabled ?? true,
        notes: contactData.notes,
        interactions: [],
        createdAt: new Date().toISOString().split('T')[0],
      };

      setContacts((prev) => [newContact, ...prev]);
    }
  };

  // Excluir contato
  const handleDeleteContact = (contactId: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== contactId));
    if (selectedContactDetailId === contactId) {
      setSelectedContactDetailId(null);
    }
  };

  // Restaurar dados padrão de exemplo
  const handleResetToDefault = () => {
    setContacts(INITIAL_CONTACTS);
    localStorage.removeItem(STORAGE_KEY);
    alert('Dados de exemplo restaurados com sucesso!');
  };

  // Importar dados via JSON
  const handleImportData = (importedContacts: Contact[]) => {
    setContacts(importedContacts);
  };

  // Tratar clique na barra de navegação
  const handleTabChange = (tab: TabType) => {
    if (tab === 'registrar') {
      // Ação primária de registrar conversa imediata
      setLogModalContactId(undefined);
      setIsLogModalOpen(true);
      return;
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Abrir modal de registro com pessoa pré-selecionada
  const handleOpenLogModal = (contactId?: string) => {
    setLogModalContactId(contactId);
    setIsLogModalOpen(true);
  };

  // Abrir modal de criação
  const handleOpenNewContactModal = () => {
    setContactToEdit(null);
    setIsFormModalOpen(true);
  };

  // Abrir modal de edição
  const handleOpenEditModal = (contact: Contact) => {
    setContactToEdit(contact);
    setIsFormModalOpen(true);
  };

  // Contagem de negligenciados para o badge da cápsula
  const neglectedCount = contacts.filter((c) => {
    const scores = computeContactScores(c);
    return scores.status === 'negligenciado';
  }).length;

  const selectedContact = contacts.find((c) => c.id === selectedContactDetailId) || null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/70 py-3 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <Heart className="w-5 h-5 fill-white/20" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-indigo-700 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                SocialSync
              </span>
              <span className="hidden sm:inline text-xs text-slate-400 ml-2 font-medium">
                Monitor de Relações & Intimidade
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {neglectedCount > 0 && (
              <button
                onClick={() => setCurrentTab('painel')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>{neglectedCount} em atraso</span>
              </button>
            )}

            {!isPwaInstalled && (
              <button
                onClick={handleInstallPwa}
                type="button"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
              >
                Instalar PWA
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentTab === 'painel' && (
          <NeglectedDashboard
            contacts={contacts}
            onOpenLogModal={handleOpenLogModal}
            onOpenContactDetail={(id) => setSelectedContactDetailId(id)}
            onOpenNewContactModal={handleOpenNewContactModal}
            onNavigateToTab={(tab) => setCurrentTab(tab)}
            onOpenScheduleModal={(c) => {
              setScheduleContact(c);
              setIsScheduleModalOpen(true);
            }}
          />
        )}

        {currentTab === 'contatos' && (
          <ContactsList
            contacts={contacts}
            onSelectContact={(id) => setSelectedContactDetailId(id)}
            onOpenNewContactModal={handleOpenNewContactModal}
            onOpenLogModal={handleOpenLogModal}
            onOpenImportModal={() => setIsImportModalOpen(true)}
          />
        )}

        {currentTab === 'metas' && (
          <SocialGoalsView
            contacts={contacts}
            onOpenLogModal={handleOpenLogModal}
            onOpenContactDetail={(id) => setSelectedContactDetailId(id)}
          />
        )}

        {currentTab === 'config' && (
          <SettingsView
            contacts={contacts}
            onResetToDefault={handleResetToDefault}
            onImportData={handleImportData}
            deferredPrompt={deferredPrompt}
            onInstallPwa={handleInstallPwa}
            isPwaInstalled={isPwaInstalled}
          />
        )}
      </main>

      {/* Apple-Style Floating Capsule Bottom Navigation Bar with Glassmorphism and Bubble Indicator */}
      <BottomNavBar
        currentTab={currentTab}
        onChangeTab={handleTabChange}
        neglectedCount={neglectedCount}
      />

      {/* Modal: Registrar Interação */}
      <LogInteractionModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        contacts={contacts}
        initialContactId={logModalContactId}
        onSaveInteraction={handleSaveInteraction}
      />

      {/* Modal: Cadastrar / Editar Contato */}
      <ContactFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSaveContact={handleSaveContact}
        contactToEdit={contactToEdit}
      />

      {/* Modal: Detalhes e Perfil do Contato */}
      <ContactDetailModal
        contact={selectedContact}
        isOpen={Boolean(selectedContactDetailId)}
        onClose={() => setSelectedContactDetailId(null)}
        onEditContact={handleOpenEditModal}
        onDeleteContact={handleDeleteContact}
        onOpenLogModal={handleOpenLogModal}
        onDeleteInteraction={handleDeleteInteraction}
        onOpenScheduleModal={(c) => {
          setScheduleContact(c);
          setIsScheduleModalOpen(true);
        }}
      />

      {/* Modal: Agendar Encontro no Calendário */}
      <ScheduleMeetModal
        contact={scheduleContact}
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setScheduleContact(null);
        }}
      />

      {/* Modal: Importar Contatos da Agenda / VCF */}
      <ImportContactsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportContacts={handleImportDeviceContacts}
      />
    </div>
  );
}

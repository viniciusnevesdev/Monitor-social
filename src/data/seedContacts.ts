import { Contact } from '../types';

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'contact-1',
    name: 'Helena Oliveira',
    nickname: 'Mãe',
    avatarColor: '#ec4899',
    phone: '+55 11 98888-1234',
    category: 'familia',
    importanceRating: 10,
    wellbeingRating: 10,
    targetIntervalDays: 3, // Deve falar a cada 3 dias
    reminderEnabled: true,
    notes: 'Ligar aos domingos e nas quartas à noite. Gosta de saber das novidades da semana.',
    createdAt: '2026-07-01',
    interactions: [
      {
        id: 'int-1',
        contactId: 'contact-1',
        date: '2026-09-02', // 8 dias atrás -> já negligenciado para meta de 3 dias!
        channel: 'ligacao',
        quality: 9,
        durationMinutes: 35,
        summary: 'Conversamos sobre a saúde dela e os planos para o feriado. Muito carinhosa.',
        nextTopicHook: 'Perguntar como foi a consulta médica e se os exames de rotina ficaram prontos.',
        createdAt: '2026-09-02T19:30:00Z',
      },
      {
        id: 'int-2',
        contactId: 'contact-1',
        date: '2026-08-28',
        channel: 'whatsapp',
        quality: 8,
        summary: 'Troca de fotos de família e receita de bolo.',
        nextTopicHook: 'Ver se ela testou a receita de bolo de fubá cremoso.',
        createdAt: '2026-08-28T14:00:00Z',
      },
    ],
  },
  {
    id: 'contact-2',
    name: 'Lucas Brandão',
    nickname: 'Lukinha',
    avatarColor: '#6366f1',
    phone: '+55 21 97654-3210',
    category: 'amigos_proximos',
    importanceRating: 9,
    wellbeingRating: 9,
    targetIntervalDays: 7, // Semanal
    reminderEnabled: true,
    notes: 'Amigo desde a escola. Sempre rende risadas e conversas sinceras.',
    createdAt: '2026-07-10',
    interactions: [
      {
        id: 'int-3',
        contactId: 'contact-2',
        date: '2026-08-20', // 21 dias atrás -> muito atrasado!
        channel: 'cafe',
        quality: 9,
        durationMinutes: 90,
        summary: 'Almoço de sábado. Conversamos sobre carreira e projetos pessoais.',
        nextTopicHook: 'Perguntar como foi o resultado final do processo seletivo dele.',
        createdAt: '2026-08-20T13:00:00Z',
      },
    ],
  },
  {
    id: 'contact-3',
    name: 'Beatriz Cavalcante',
    nickname: 'Bia',
    avatarColor: '#0ea5e9',
    phone: '+55 11 99123-4567',
    category: 'amigos_proximos',
    importanceRating: 8,
    wellbeingRating: 9,
    targetIntervalDays: 10,
    reminderEnabled: true,
    notes: 'Companheira de treinos e conversas sobre livros e tecnologia.',
    createdAt: '2026-08-01',
    interactions: [
      {
        id: 'int-4',
        contactId: 'contact-3',
        date: '2026-09-08', // 2 dias atrás -> Em dia!
        channel: 'whatsapp',
        quality: 8,
        summary: 'Comentamos sobre um artigo de IA e combinamos de correr no parque no fim do mês.',
        createdAt: '2026-09-08T18:15:00Z',
      },
      {
        id: 'int-5',
        contactId: 'contact-3',
        date: '2026-08-30',
        channel: 'presencial',
        quality: 9,
        summary: 'Corrida no Ibirapuera e café depois.',
        createdAt: '2026-08-30T09:00:00Z',
      },
    ],
  },
  {
    id: 'contact-4',
    name: 'Dr. Roberto Mendes',
    nickname: 'Mentor Roberto',
    avatarColor: '#8b5cf6',
    phone: '+55 11 98111-2233',
    category: 'mentores',
    importanceRating: 9,
    wellbeingRating: 8,
    targetIntervalDays: 21, // A cada 3 semanas
    reminderEnabled: true,
    notes: 'Mentor profissional. Sempre traz clareza estratégica e conselhos valiosos.',
    createdAt: '2026-06-15',
    interactions: [
      {
        id: 'int-6',
        contactId: 'contact-4',
        date: '2026-08-15', // 26 dias atrás -> Entrando na zona de atenção/atraso
        channel: 'videochamada',
        quality: 9,
        durationMinutes: 45,
        summary: 'Mentoria sobre liderança e novos desafios na equipe.',
        createdAt: '2026-08-15T16:00:00Z',
      },
    ],
  },
  {
    id: 'contact-5',
    name: 'Carolina Diniz',
    nickname: 'Carol',
    avatarColor: '#10b981',
    phone: '+55 31 99876-5432',
    category: 'conexoes',
    importanceRating: 6,
    wellbeingRating: 7,
    targetIntervalDays: 30, // Mensal
    reminderEnabled: false,
    notes: 'Ex-colega de pós-graduação. Boa para parcerias e networking.',
    createdAt: '2026-05-20',
    interactions: [
      {
        id: 'int-7',
        contactId: 'contact-5',
        date: '2026-08-10', // 31 dias atrás
        channel: 'mensagem',
        quality: 6,
        summary: 'Parabenizei pelo novo cargo no LinkedIn e trocamos algumas mensagens.',
        createdAt: '2026-08-10T11:20:00Z',
      },
    ],
  },
];

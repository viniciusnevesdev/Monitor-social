export type ContactCategory = 'familia' | 'amigos_proximos' | 'conexoes' | 'mentores' | 'conhecidos';

export type InteractionChannel = 'whatsapp' | 'ligacao' | 'presencial' | 'cafe' | 'videochamada' | 'mensagem';

export interface Interaction {
  id: string;
  contactId: string;
  date: string; // YYYY-MM-DD
  channel: InteractionChannel;
  quality: number; // 1 to 10: profundidade e qualidade da conversa
  durationMinutes?: number;
  summary: string;
  topicsDiscussed?: string;
  followUpNote?: string;
  nextTopicHook?: string; // Memória social: o que perguntar na próxima conversa
  createdAt: string;
}

export interface Contact {
  id: string;
  name: string;
  nickname?: string;
  avatarColor: string;
  phone?: string;
  email?: string;
  category: ContactCategory;
  birthday?: string;
  
  // Notas subjetivas do usuário
  importanceRating: number; // 1 to 10: o quanto essa pessoa é importante na minha vida
  wellbeingRating: number;  // 1 to 10: o quanto essa pessoa faz eu me sentir bem
  
  // Metas de relacionamento
  targetIntervalDays: number; // Intervalo ideal de contato em dias (ex: 7 para semanal, 14 para quinzenal, 30 para mensal)
  reminderEnabled: boolean;
  notes?: string;
  
  // Dados de histórico
  interactions: Interaction[];
  createdAt: string;
}

export interface CalculatedScores {
  lastInteractionDate: string | null;
  daysSinceLastInteraction: number;
  isOverdue: boolean;
  overdueDays: number;
  
  frequencyScore: number; // 1 to 10 baseado em cumprimento do intervalo
  avgQualityScore: number; // 1 to 10 média das qualidades
  intimacyScore: number; // 1 to 10 fórmula combinada (frequência + qualidade histórica)
  
  priorityScore: number; // Pontuação de negligência: quanto maior, mais urgente reconectar
  status: 'em_dia' | 'atencao' | 'negligenciado';
}

export interface SocialGoal {
  id: string;
  title: string;
  targetCount: number;
  completedCount: number;
  period: 'semanal' | 'mensal';
}

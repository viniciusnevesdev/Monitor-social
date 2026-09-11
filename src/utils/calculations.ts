import { Contact, CalculatedScores, Interaction } from '../types';

export const CATEGORY_LABELS: Record<string, { label: string; color: string; badgeBg: string }> = {
  amigos_proximos: { label: 'Amigos Próximos', color: '#6366f1', badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  familia: { label: 'Família', color: '#ec4899', badgeBg: 'bg-pink-50 text-pink-700 border-pink-200' },
  conexoes: { label: 'Conexões Profissionais', color: '#0ea5e9', badgeBg: 'bg-sky-50 text-sky-700 border-sky-200' },
  mentores: { label: 'Mentores & Inspirações', color: '#8b5cf6', badgeBg: 'bg-purple-50 text-purple-700 border-purple-200' },
  conhecidos: { label: 'Conhecidos', color: '#64748b', badgeBg: 'bg-slate-100 text-slate-700 border-slate-200' },
};

export const CHANNEL_CONFIG: Record<string, { label: string; icon: string }> = {
  whatsapp: { label: 'WhatsApp', icon: 'MessageCircle' },
  ligacao: { label: 'Ligação', icon: 'PhoneCall' },
  presencial: { label: 'Presencial', icon: 'Users' },
  cafe: { label: 'Café / Almoço', icon: 'Coffee' },
  videochamada: { label: 'Chamada de Vídeo', icon: 'Video' },
  mensagem: { label: 'Mensagem Direta', icon: 'Mail' },
};

/**
 * Retorna a diferença em dias entre duas datas (formato YYYY-MM-DD ou Date)
 */
export function getDaysDifference(dateString: string | null): number {
  if (!dateString) return 999;
  const target = new Date(dateString);
  const now = new Date();
  
  // Normalizar para meia-noite para evitar desvios de horas
  const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffMs = nowMidnight.getTime() - targetMidnight.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Calcula todas as métricas analíticas e de negligência de um contato
 */
export function computeContactScores(contact: Contact): CalculatedScores {
  const interactions = contact.interactions || [];
  
  // Encontrar data da última interação
  let lastDate: string | null = null;
  if (interactions.length > 0) {
    const sorted = [...interactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    lastDate = sorted[0].date;
  }
  
  const daysSince = getDaysDifference(lastDate);
  const targetInterval = Math.max(1, contact.targetIntervalDays || 14);
  const overdueDays = Math.max(0, daysSince - targetInterval);
  const isOverdue = daysSince > targetInterval;
  
  // 1. FREQUÊNCIA SCORE (1 a 10)
  // Se contatado recentemente dentro do intervalo: nota alta
  // Se atrasado: nota decai progressivamente
  let frequencyScore: number;
  if (interactions.length === 0) {
    frequencyScore = 2.0;
  } else {
    const ratio = daysSince / targetInterval;
    if (ratio <= 0.5) {
      frequencyScore = 10.0;
    } else if (ratio <= 1.0) {
      frequencyScore = 8.5 + (1 - ratio) * 3; // 8.5 a 10
    } else if (ratio <= 1.5) {
      frequencyScore = 6.0 + (1.5 - ratio) * 5; // 6 a 8.5
    } else if (ratio <= 2.5) {
      frequencyScore = 3.5 + (2.5 - ratio) * 2.5; // 3.5 a 6
    } else {
      frequencyScore = Math.max(1.0, 3.5 - (ratio - 2.5) * 0.5);
    }
  }

  // 2. QUALIDADE MÉDIA (1 a 10)
  // Baseado nas avaliações das conversas registradas (peso maior para as mais recentes)
  let avgQualityScore: number;
  if (interactions.length === 0) {
    avgQualityScore = 5.0; // Padrão neutro inicial
  } else {
    let totalWeightedScore = 0;
    let totalWeight = 0;
    const sorted = [...interactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    sorted.forEach((interaction, index) => {
      // Peso decrescente para interações mais antigas
      const recencyWeight = Math.max(0.3, 1 - index * 0.15);
      totalWeightedScore += (interaction.quality || 5) * recencyWeight;
      totalWeight += recencyWeight;
    });
    
    avgQualityScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 5.0;
  }

  // 3. NOTA DE INTIMIDADE CALCULADA (1 a 10)
  // Conforme solicitação: baseada na frequência e na qualidade da comunicação
  const intimacyScore = Number((frequencyScore * 0.45 + avgQualityScore * 0.55).toFixed(1));

  // 4. NOTA DE PRIORIDADE DE NEGLIGÊNCIA (0 a 100)
  // Integra a urgência pelo tempo sem contato + importância na vida + fator de bem-estar
  // Pessoas muito importantes e que fazem muito bem que estão sem contato geram a MAIOR prioridade
  const overdueRatio = Math.min(3, daysSince / targetInterval);
  const urgencyComponent = Math.min(50, overdueRatio * 18); // até 50 pontos
  const importanceComponent = (contact.importanceRating / 10) * 30; // até 30 pontos
  const wellbeingComponent = (contact.wellbeingRating / 10) * 20; // até 20 pontos
  
  let priorityScore = urgencyComponent + importanceComponent + wellbeingComponent;
  // Se está super em dia, amortecer a pontuação de negligência
  if (daysSince <= targetInterval * 0.6) {
    priorityScore = priorityScore * 0.35;
  } else if (daysSince <= targetInterval) {
    priorityScore = priorityScore * 0.7;
  }
  priorityScore = Math.min(100, Math.max(0, Math.round(priorityScore)));

  // Status de status visual
  let status: 'em_dia' | 'atencao' | 'negligenciado';
  if (daysSince <= targetInterval * 0.75) {
    status = 'em_dia';
  } else if (daysSince <= targetInterval) {
    status = 'atencao';
  } else {
    status = 'negligenciado';
  }

  return {
    lastInteractionDate: lastDate,
    daysSinceLastInteraction: daysSince,
    isOverdue,
    overdueDays,
    frequencyScore: Number(frequencyScore.toFixed(1)),
    avgQualityScore: Number(avgQualityScore.toFixed(1)),
    intimacyScore,
    priorityScore,
    status,
  };
}

/**
 * Formata dias para texto amigável em português
 */
export function formatTimeAgo(days: number): string {
  if (days >= 999) return 'Nunca registrado';
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Ontem';
  if (days < 7) return `Há ${days} dias`;
  if (days < 14) return 'Há 1 semana';
  if (days < 30) return `Há ${Math.floor(days / 7)} semanas`;
  if (days < 60) return 'Há 1 mês';
  return `Há ${Math.floor(days / 30)} meses`;
}

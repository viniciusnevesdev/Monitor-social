import React from 'react';
import { Heart, Star, Sparkles, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

interface ScoreBadgeProps {
  type: 'intimacy' | 'importance' | 'wellbeing' | 'priority' | 'status';
  value: number | string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({
  type,
  value,
  size = 'md',
  showLabel = true,
}) => {
  if (type === 'status') {
    const statusMap = {
      em_dia: {
        label: 'Em Dia',
        icon: CheckCircle2,
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      },
      atencao: {
        label: 'Atenção',
        icon: Clock,
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
      },
      negligenciado: {
        label: 'Negligenciado',
        icon: AlertTriangle,
        bg: 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse',
      },
    };

    const cfg = statusMap[value as keyof typeof statusMap] || statusMap.atencao;
    const Icon = cfg.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg}`}
      >
        <Icon className="w-3.5 h-3.5 shrink-0" />
        {showLabel && <span>{cfg.label}</span>}
      </span>
    );
  }

  const num = typeof value === 'number' ? value : parseFloat(value) || 0;

  if (type === 'intimacy') {
    // Intimacy calculated: 1 to 10
    const colorClass =
      num >= 8
        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
        : num >= 5
        ? 'bg-sky-50 text-sky-700 border-sky-200'
        : 'bg-slate-100 text-slate-700 border-slate-200';

    return (
      <span
        title="Nota de Intimidade (Frequência + Qualidade)"
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold border ${colorClass} ${
          size === 'sm' ? 'text-xs' : 'text-sm'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
        {showLabel && <span className="text-[11px] font-medium opacity-80">Intimidade:</span>}
        <span className="font-bold">{num.toFixed(1)}</span>
        <span className="text-[10px] opacity-60">/10</span>
      </span>
    );
  }

  if (type === 'importance') {
    // Importância dada pelo usuário: 1 to 10
    return (
      <span
        title="Importância atribuída na sua vida"
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold border bg-amber-50 text-amber-800 border-amber-200 ${
          size === 'sm' ? 'text-xs' : 'text-sm'
        }`}
      >
        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
        {showLabel && <span className="text-[11px] font-medium opacity-80">Importância:</span>}
        <span className="font-bold">{num}</span>
        <span className="text-[10px] opacity-60">/10</span>
      </span>
    );
  }

  if (type === 'wellbeing') {
    // O quanto a pessoa faz você se sentir bem: 1 to 10
    return (
      <span
        title="O quanto essa pessoa faz você se sentir bem"
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold border bg-rose-50 text-rose-700 border-rose-200 ${
          size === 'sm' ? 'text-xs' : 'text-sm'
        }`}
      >
        <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-500" />
        {showLabel && <span className="text-[11px] font-medium opacity-80">Bem-estar:</span>}
        <span className="font-bold">{num}</span>
        <span className="text-[10px] opacity-60">/10</span>
      </span>
    );
  }

  // Priority / Neglect score (0 to 100)
  const priorityColor =
    num >= 70
      ? 'bg-rose-100 text-rose-800 border-rose-300'
      : num >= 40
      ? 'bg-amber-100 text-amber-800 border-amber-300'
      : 'bg-emerald-100 text-emerald-800 border-emerald-300';

  return (
    <span
      title="Prioridade de Negligência (Combinação de Urgência, Importância e Bem-Estar)"
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold border ${priorityColor} text-xs`}
    >
      <AlertTriangle className="w-3 h-3" />
      {showLabel && <span className="text-[10px] uppercase font-semibold">Prioridade:</span>}
      <span>{num}%</span>
    </span>
  );
};

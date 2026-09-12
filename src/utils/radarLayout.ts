export type RadarElementId =
  | 'avatar'
  | 'name'
  | 'category'
  | 'status'
  | 'scores'
  | 'lastContact'
  | 'interactionCount'
  | 'action';

export interface RadarElementLayout {
  x: number;
  y: number;
  w: number;
  h: number;
  fontSize?: number;
  fontWeight?: 400 | 500 | 600 | 700 | 800;
  color?: string;
  align?: 'left' | 'center' | 'right';
}

export interface RadarCardLayout {
  schema: 'lacos-radar-card-layout';
  version: 2;
  elements: Record<RadarElementId, RadarElementLayout>;
}

export const RADAR_ELEMENT_LABELS: Record<RadarElementId, string> = {
  avatar: 'Foto / inicial',
  name: 'Nome',
  category: 'Categoria e apelido',
  status: 'Situação',
  scores: 'Indicadores',
  lastContact: 'Último contato',
  interactionCount: 'Contagem de conversas',
  action: 'Botão Registrar',
};

export const RADAR_TEXT_ELEMENTS: RadarElementId[] = [
  'name',
  'category',
  'lastContact',
  'interactionCount',
];

export const DEFAULT_RADAR_CARD_LAYOUT: RadarCardLayout = {
  schema: 'lacos-radar-card-layout',
  version: 2,
  elements: {
    avatar: { x: 6, y: 6, w: 15, h: 17 },
    name: { x: 24, y: 6, w: 35, h: 9, fontSize: 18, fontWeight: 800, color: '#0f172a', align: 'left' },
    category: { x: 24, y: 16, w: 34, h: 7, fontSize: 10, fontWeight: 600, color: '#64748b', align: 'left' },
    status: { x: 60, y: 7, w: 34, h: 10 },
    lastContact: { x: 6, y: 27, w: 88, h: 20, fontSize: 11, fontWeight: 500, color: '#526a96', align: 'left' },
    scores: { x: 6, y: 50, w: 88, h: 14 },
    interactionCount: { x: 6, y: 67, w: 88, h: 14, fontSize: 11, fontWeight: 500, color: '#13283d', align: 'left' },
    action: { x: 6, y: 84, w: 58, h: 11 },
  },
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function cloneRadarLayout(layout: RadarCardLayout): RadarCardLayout {
  return JSON.parse(JSON.stringify(layout)) as RadarCardLayout;
}

export function normalizeRadarLayout(value: unknown): RadarCardLayout {
  const fallback = cloneRadarLayout(DEFAULT_RADAR_CARD_LAYOUT);
  if (!value || typeof value !== 'object') return fallback;
  const candidate = value as Partial<RadarCardLayout>;
  if (candidate.schema !== 'lacos-radar-card-layout' || candidate.version !== 2 || !candidate.elements) return fallback;

  const elements = { ...fallback.elements };
  (Object.keys(fallback.elements) as RadarElementId[]).forEach((id) => {
    const source = (candidate.elements as Partial<Record<RadarElementId, RadarElementLayout>>)[id];
    if (!source) return;
    const base = fallback.elements[id];
    const w = clamp(Number(source.w) || base.w, 8, 94);
    const h = clamp(Number(source.h) || base.h, 6, 92);
    elements[id] = {
      ...base,
      ...source,
      w,
      h,
      x: clamp(Number(source.x) || 0, 0, 100 - w),
      y: clamp(Number(source.y) || 0, 0, 100 - h),
      fontSize: source.fontSize ? clamp(Number(source.fontSize), 9, 30) : base.fontSize,
    };
  });

  return { schema: 'lacos-radar-card-layout', version: 2, elements };
}

export function patchRadarElement(
  layout: RadarCardLayout,
  id: RadarElementId,
  patch: Partial<RadarElementLayout>
): RadarCardLayout {
  const current = layout.elements[id];
  const merged = { ...current, ...patch };
  const w = clamp(merged.w, 8, 94);
  const h = clamp(merged.h, 6, 92);
  return {
    ...layout,
    elements: {
      ...layout.elements,
      [id]: {
        ...merged,
        w,
        h,
        x: clamp(merged.x, 0, 100 - w),
        y: clamp(merged.y, 0, 100 - h),
      },
    },
  };
}

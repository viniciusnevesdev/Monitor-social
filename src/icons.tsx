import React from 'react';
import * as Lucide from 'lucide-react';

export const ICON_OVERRIDE_STORAGE_KEY = 'monitor_social_icon_overrides_v1';

export const ICON_NAMES = [
  'AlertCircle','AlertOctagon','AlertTriangle','ArrowRight','ArrowUpDown','ArrowUpRight','Award','Bell','BellRing',
  'Calendar','Check','CheckCircle2','ChevronRight','Clock','Cloud','CloudDownload','CloudUpload','Coffee','Compass',
  'Copy','Download','Edit2','ExternalLink','FileText','Flame','Grid','Heart','Info','Key','Lightbulb','Mail','MapPin',
  'Maximize2','MessageCircle','MessageSquare','MessageSquareQuote','Mic','Phone','PhoneCall','Plus','PlusCircle',
  'RefreshCw','RotateCcw','Search','Send','Share2','ShieldCheck','Sliders','SlidersHorizontal','Smartphone','Sparkles',
  'Star','Target','Trash2','TrendingUp','Upload','User','Users','Video','X'
] as const;

export type AppIconName = (typeof ICON_NAMES)[number];
type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: string | number;
  absoluteStrokeWidth?: boolean;
};

function readOverrides(): Record<string,string> {
  if (typeof window === 'undefined') return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(ICON_OVERRIDE_STORAGE_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function getAllIconOverrides(): Record<string,string> {
  return readOverrides();
}

export function getIconOverride(name: AppIconName): string {
  return readOverrides()[name] || '';
}

export function setIconOverride(name: AppIconName, rawSvg: string) {
  const next = readOverrides();
  const clean = sanitizeCustomSvg(rawSvg);
  if (!clean) throw new Error('SVG inválido');
  next[name] = rawSvg.trim();
  localStorage.setItem(ICON_OVERRIDE_STORAGE_KEY, JSON.stringify(next));
}

export function resetIconOverride(name: AppIconName) {
  const next = readOverrides();
  delete next[name];
  localStorage.setItem(ICON_OVERRIDE_STORAGE_KEY, JSON.stringify(next));
}

export function sanitizeCustomSvg(raw: string): string {
  if (typeof DOMParser === 'undefined') return '';

  let source = String(raw || '')
    .trim()
    .replace(/^\`\`\`(?:svg|xml|html|jsx|tsx)?\s*/i, '')
    .replace(/\s*\`\`\`$/i, '')
    .trim();

  if (!source) return '';

  // Aceita documentos SVG completos mesmo quando vêm com cabeçalho XML,
  // DOCTYPE, comentários ou algum texto explicativo antes/depois do SVG.
  source = source
    .replace(/<\?xml[\s\S]*?\?>/gi, '')
    .replace(/<!DOCTYPE[\s\S]*?>/gi, '')
    .trim();

  const svgStart = source.search(/<svg\b/i);
  if (svgStart >= 0) {
    const svgEndMatch = source.match(/<\/svg\s*>/gi);
    if (svgEndMatch?.length) {
      const lastClose = source.toLowerCase().lastIndexOf('</svg>');
      source = source.slice(svgStart, lastClose + 6);
    } else {
      source = source.slice(svgStart);
    }
  }

  // Normaliza atributos comuns de JSX/React para atributos SVG reais.
  source = source
    .replace(/\bclassName\s*=/g, 'class=')
    .replace(/\bstrokeWidth\s*=/g, 'stroke-width=')
    .replace(/\bstrokeLinecap\s*=/g, 'stroke-linecap=')
    .replace(/\bstrokeLinejoin\s*=/g, 'stroke-linejoin=')
    .replace(/\bstrokeMiterlimit\s*=/g, 'stroke-miterlimit=')
    .replace(/\bfillRule\s*=/g, 'fill-rule=')
    .replace(/\bclipRule\s*=/g, 'clip-rule=')
    .replace(/\bfillOpacity\s*=/g, 'fill-opacity=')
    .replace(/\bstrokeOpacity\s*=/g, 'stroke-opacity=')
    .replace(/\bstrokeDasharray\s*=/g, 'stroke-dasharray=')
    .replace(/\bstrokeDashoffset\s*=/g, 'stroke-dashoffset=')
    .replace(/\btabIndex\s*=/g, 'tabindex=')
    .replace(/\{\s*['"]([^'"]+)['"]\s*\}/g, '"$1"')
    .replace(/\{\s*([0-9.]+)\s*\}/g, '"$1"');

  // Entidades HTML comuns não existem no parser XML puro.
  source = source
    .replace(/&nbsp;/gi, '&#160;')
    .replace(/&copy;/gi, '&#169;')
    .replace(/&reg;/gi, '&#174;');

  const isFullSvg = /^\s*<svg\b/i.test(source);
  const wrapped = isFullSvg
    ? source
    : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none">${source}</svg>`;

  let doc = new DOMParser().parseFromString(wrapped, 'image/svg+xml');
  let svg = doc.documentElement;

  // Fallback tolerante para snippets que o parser XML rejeita mas o navegador
  // consegue interpretar como HTML/SVG válido.
  if (!svg || svg.nodeName.toLowerCase() !== 'svg' || doc.querySelector('parsererror')) {
    const htmlDoc = new DOMParser().parseFromString(
      isFullSvg ? wrapped : `<body>${wrapped}</body>`,
      'text/html'
    );
    const htmlSvg = htmlDoc.querySelector('svg');
    if (!htmlSvg) return '';

    const serialized = htmlSvg.outerHTML;
    doc = new DOMParser().parseFromString(serialized, 'image/svg+xml');
    svg = doc.documentElement;

    if (!svg || svg.nodeName.toLowerCase() !== 'svg' || doc.querySelector('parsererror')) {
      return '';
    }
  }

  // Se foi colado apenas um <symbol>, transforma o conteúdo em SVG visível.
  const onlySymbol = svg.children.length === 1 && svg.firstElementChild?.tagName.toLowerCase() === 'symbol'
    ? svg.firstElementChild
    : null;
  if (onlySymbol) {
    const symbolViewBox = onlySymbol.getAttribute('viewBox');
    if (symbolViewBox && !svg.getAttribute('viewBox')) svg.setAttribute('viewBox', symbolViewBox);
    svg.innerHTML = onlySymbol.innerHTML;
  }

  svg.querySelectorAll('script,foreignObject,iframe,object,embed').forEach((node) => node.remove());

  svg.querySelectorAll('*').forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim();

      if (name.startsWith('on')) {
        el.removeAttribute(attr.name);
        return;
      }

      if ((name === 'href' || name === 'xlink:href')) {
        // Referências internas como #gradient e #mask continuam permitidas.
        if (/^(?:https?:|data:|javascript:)/i.test(value)) el.removeAttribute(attr.name);
      }
    });
  });

  Array.from(svg.attributes).forEach((attr) => {
    if (attr.name.toLowerCase().startsWith('on')) svg.removeAttribute(attr.name);
  });

  if (!svg.getAttribute('xmlns')) {
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }

  return svg.outerHTML;
}

function cleanStrokeWeightClasses(value = '') {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => !/^stroke-(?:\[[0-9.]+(?:px)?\]|[0-9]+(?:\.[0-9]+)?)$/.test(token))
    .join(' ');
}

function createAppIcon(name: AppIconName): React.FC<IconProps> {
  const Native = (Lucide as unknown as Record<string, React.ComponentType<any>>)[name];

  const AppIcon: React.FC<IconProps> = (props) => {
    const override = getIconOverride(name);
    const {
      strokeWidth: _ignoredStrokeWidth,
      absoluteStrokeWidth: _ignoredAbsoluteStrokeWidth,
      className = '',
      size,
      color,
      style,
      ...rest
    } = props;

    const cleanClassName = cleanStrokeWeightClasses(className);

    if (!override) {
      return (
        <Native
          {...rest}
          className={cleanClassName}
          size={size}
          color={color}
          style={style}
        />
      );
    }

    const cleanSvg = sanitizeCustomSvg(override);
    if (!cleanSvg) {
      return (
        <Native
          {...rest}
          className={cleanClassName}
          size={size}
          color={color}
          style={style}
        />
      );
    }

    const hasWidthClass = /(?:^|\s)w-/.test(cleanClassName);
    const hasHeightClass = /(?:^|\s)h-/.test(cleanClassName);
    const customStyle: React.CSSProperties = {
      ...(style as React.CSSProperties),
      ...(color ? { color } : {}),
      ...(!hasWidthClass && size ? { width: size } : {}),
      ...(!hasHeightClass && size ? { height: size } : {}),
    };

    return (
      <span
        {...(rest as React.HTMLAttributes<HTMLSpanElement>)}
        className={`app-custom-icon ${cleanClassName}`.trim()}
        style={customStyle}
        aria-hidden={props['aria-label'] ? undefined : true}
        dangerouslySetInnerHTML={{ __html: cleanSvg }}
      />
    );
  };

  AppIcon.displayName = `AppIcon(${name})`;
  return AppIcon;
}

export const ICON_COMPONENTS = Object.fromEntries(
  ICON_NAMES.map((name) => [name, createAppIcon(name)])
) as Record<AppIconName, React.FC<IconProps>>;

export const AlertCircle = ICON_COMPONENTS.AlertCircle;
export const AlertOctagon = ICON_COMPONENTS.AlertOctagon;
export const AlertTriangle = ICON_COMPONENTS.AlertTriangle;
export const ArrowRight = ICON_COMPONENTS.ArrowRight;
export const ArrowUpDown = ICON_COMPONENTS.ArrowUpDown;
export const ArrowUpRight = ICON_COMPONENTS.ArrowUpRight;
export const Award = ICON_COMPONENTS.Award;
export const Bell = ICON_COMPONENTS.Bell;
export const BellRing = ICON_COMPONENTS.BellRing;
export const Calendar = ICON_COMPONENTS.Calendar;
export const Check = ICON_COMPONENTS.Check;
export const CheckCircle2 = ICON_COMPONENTS.CheckCircle2;
export const ChevronRight = ICON_COMPONENTS.ChevronRight;
export const Clock = ICON_COMPONENTS.Clock;
export const Cloud = ICON_COMPONENTS.Cloud;
export const CloudDownload = ICON_COMPONENTS.CloudDownload;
export const CloudUpload = ICON_COMPONENTS.CloudUpload;
export const Coffee = ICON_COMPONENTS.Coffee;
export const Compass = ICON_COMPONENTS.Compass;
export const Copy = ICON_COMPONENTS.Copy;
export const Download = ICON_COMPONENTS.Download;
export const Edit2 = ICON_COMPONENTS.Edit2;
export const ExternalLink = ICON_COMPONENTS.ExternalLink;
export const FileText = ICON_COMPONENTS.FileText;
export const Flame = ICON_COMPONENTS.Flame;
export const Grid = ICON_COMPONENTS.Grid;
export const Heart = ICON_COMPONENTS.Heart;
export const Info = ICON_COMPONENTS.Info;
export const Key = ICON_COMPONENTS.Key;
export const Lightbulb = ICON_COMPONENTS.Lightbulb;
export const Mail = ICON_COMPONENTS.Mail;
export const MapPin = ICON_COMPONENTS.MapPin;
export const Maximize2 = ICON_COMPONENTS.Maximize2;
export const MessageCircle = ICON_COMPONENTS.MessageCircle;
export const MessageSquare = ICON_COMPONENTS.MessageSquare;
export const MessageSquareQuote = ICON_COMPONENTS.MessageSquareQuote;
export const Mic = ICON_COMPONENTS.Mic;
export const Phone = ICON_COMPONENTS.Phone;
export const PhoneCall = ICON_COMPONENTS.PhoneCall;
export const Plus = ICON_COMPONENTS.Plus;
export const PlusCircle = ICON_COMPONENTS.PlusCircle;
export const RefreshCw = ICON_COMPONENTS.RefreshCw;
export const RotateCcw = ICON_COMPONENTS.RotateCcw;
export const Search = ICON_COMPONENTS.Search;
export const Send = ICON_COMPONENTS.Send;
export const Share2 = ICON_COMPONENTS.Share2;
export const ShieldCheck = ICON_COMPONENTS.ShieldCheck;
export const Sliders = ICON_COMPONENTS.Sliders;
export const SlidersHorizontal = ICON_COMPONENTS.SlidersHorizontal;
export const Smartphone = ICON_COMPONENTS.Smartphone;
export const Sparkles = ICON_COMPONENTS.Sparkles;
export const Star = ICON_COMPONENTS.Star;
export const Target = ICON_COMPONENTS.Target;
export const Trash2 = ICON_COMPONENTS.Trash2;
export const TrendingUp = ICON_COMPONENTS.TrendingUp;
export const Upload = ICON_COMPONENTS.Upload;
export const User = ICON_COMPONENTS.User;
export const Users = ICON_COMPONENTS.Users;
export const Video = ICON_COMPONENTS.Video;
export const X = ICON_COMPONENTS.X;

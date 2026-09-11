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
  const source = String(raw || '').trim();
  if (!source || typeof DOMParser === 'undefined') return '';

  const wrapped = /^<svg\b/i.test(source)
    ? source
    : `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none">${source}</svg>`;

  const doc = new DOMParser().parseFromString(wrapped, 'image/svg+xml');
  const svg = doc.documentElement;
  if (!svg || svg.nodeName.toLowerCase() !== 'svg' || doc.querySelector('parsererror')) return '';

  svg.querySelectorAll('script,foreignObject,style,iframe,object,embed').forEach((node) => node.remove());
  svg.querySelectorAll('*').forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim();
      if (name.startsWith('on')) el.removeAttribute(attr.name);
      if (name === 'style') el.removeAttribute(attr.name);
      if ((name === 'href' || name === 'xlink:href') && /^(?:https?:|data:|javascript:)/i.test(value)) {
        el.removeAttribute(attr.name);
      }
    });
  });

  Array.from(svg.attributes).forEach((attr) => {
    const name = attr.name.toLowerCase();
    if (name.startsWith('on') || name === 'style') svg.removeAttribute(attr.name);
  });

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

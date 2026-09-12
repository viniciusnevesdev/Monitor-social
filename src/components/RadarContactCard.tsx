import React from 'react';
import { Contact, CalculatedScores } from '../types';
import { formatTimeAgo, CATEGORY_LABELS } from '../utils/calculations';
import { RadarCardLayout, RadarElementId, RadarElementLayout } from '../utils/radarLayout';
import { Calendar, MessageSquare } from '../icons';
import { ScoreBadge } from './ScoreBadge';

interface RadarContactCardProps {
  contact: Contact;
  scores: CalculatedScores;
  layout: RadarCardLayout;
  onSelectContact?: () => void;
  onOpenLogModal?: () => void;
  editingElement?: RadarElementId;
  onSelectElement?: (id: RadarElementId) => void;
  onElementPointerDown?: (id: RadarElementId, event: React.PointerEvent<HTMLDivElement>) => void;
  onElementResizePointerDown?: (id: RadarElementId, event: React.PointerEvent<HTMLSpanElement>) => void;
}

const position = (element: RadarElementLayout): React.CSSProperties => ({
  left: `${element.x}%`,
  top: `${element.y}%`,
  width: `${element.w}%`,
  height: `${element.h}%`,
});

const textStyle = (element: RadarElementLayout): React.CSSProperties => ({
  ...position(element),
  fontSize: element.fontSize ? `${element.fontSize}px` : undefined,
  fontWeight: element.fontWeight,
  color: element.color,
  textAlign: element.align,
});

export const RadarContactCard: React.FC<RadarContactCardProps> = ({
  contact,
  scores,
  layout,
  onSelectContact,
  onOpenLogModal,
  editingElement,
  onSelectElement,
  onElementPointerDown,
  onElementResizePointerDown,
}) => {
  const cat = CATEGORY_LABELS[contact.category] || CATEGORY_LABELS.conhecidos;
  const editMode = Boolean(onSelectElement);

  const elementProps = (id: RadarElementId) => ({
    className: `radar-card-element ${editingElement === id ? 'radar-card-element--selected' : ''}`,
    onClick: (event: React.MouseEvent<HTMLDivElement>) => {
      if (!editMode) return;
      event.stopPropagation();
      onSelectElement?.(id);
    },
    onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => {
      if (!editMode) return;
      event.stopPropagation();
      onSelectElement?.(id);
      onElementPointerDown?.(id, event);
    },
    role: editMode ? 'button' : undefined,
    tabIndex: editMode ? 0 : undefined,
    'aria-label': editMode ? `Editar ${id}` : undefined,
  });

  return (
    <article
      className={`radar-card ${editMode ? 'radar-card--editing' : ''}`}
      onClick={editMode ? undefined : onSelectContact}
    >
      <div {...elementProps('avatar')} style={position(layout.elements.avatar)}>
        <div
          className="radar-card-avatar"
          style={{ backgroundColor: contact.avatarColor || '#6366f1' }}
        >
          {contact.name.charAt(0).toUpperCase()}
        </div>
      </div>

      <div {...elementProps('name')} className={`${elementProps('name').className} radar-card-text radar-card-name`} style={textStyle(layout.elements.name)}>
        {contact.name}
      </div>

      <div {...elementProps('category')} className={`${elementProps('category').className} radar-card-text radar-card-category`} style={textStyle(layout.elements.category)}>
        <span className={`radar-card-category-badge ${cat.badgeBg}`}>{cat.label}</span>
        {contact.nickname && <span className="radar-card-nickname">({contact.nickname})</span>}
      </div>

      <div {...elementProps('status')} className={`${elementProps('status').className} radar-card-status`} style={position(layout.elements.status)}>
        <ScoreBadge type="status" value={scores.status} size="sm" showLabel={false} />
      </div>

      <div {...elementProps('scores')} className={`${elementProps('scores').className} radar-card-scores`} style={position(layout.elements.scores)}>
        <div><span>Intimidade</span><strong className="text-indigo-700">{scores.intimacyScore}</strong></div>
        <div><span>Importância</span><strong className="text-amber-600">{contact.importanceRating}/10</strong></div>
        <div><span>Bem-estar</span><strong className="text-rose-600">{contact.wellbeingRating}/10</strong></div>
      </div>

      <div {...elementProps('lastContact')} className={`${elementProps('lastContact').className} radar-card-text radar-card-last-contact`} style={textStyle(layout.elements.lastContact)}>
        <Calendar />
        <span>{formatTimeAgo(scores.daysSinceLastInteraction)}</span>
        <span className="radar-card-goal">Meta: {contact.targetIntervalDays}d</span>
      </div>

      <div {...elementProps('interactionCount')} className={`${elementProps('interactionCount').className} radar-card-text radar-card-interaction-count`} style={textStyle(layout.elements.interactionCount)}>
        {contact.interactions?.length || 0} {(contact.interactions?.length || 0) === 1 ? 'conversa' : 'conversas'}
      </div>

      <div {...elementProps('action')} className={`${elementProps('action').className} radar-card-action`} style={position(layout.elements.action)}>
        <button
          onClick={(event) => {
            event.stopPropagation();
            if (!editMode) onOpenLogModal?.();
          }}
          type="button"
          tabIndex={editMode ? -1 : undefined}
        >
          <MessageSquare />
          Registrar
        </button>
      </div>
      {editingElement && (
        <span
          className="radar-card-resize-handle"
          style={{
            left: `${layout.elements[editingElement].x + layout.elements[editingElement].w}%`,
            top: `${layout.elements[editingElement].y + layout.elements[editingElement].h}%`,
          }}
          onPointerDown={(event) => {
            event.stopPropagation();
            onElementResizePointerDown?.(editingElement, event);
          }}
          aria-hidden="true"
        />
      )}
    </article>
  );
};

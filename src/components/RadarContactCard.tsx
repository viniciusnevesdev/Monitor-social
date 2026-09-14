import React from 'react';
import { Contact, CalculatedScores } from '../types';
import { formatTimeAgo, CATEGORY_LABELS } from '../utils/calculations';
import { RadarCardLayout, RadarElementId, RadarElementLayout } from '../utils/radarLayout';
import { AlertTriangle, Calendar, Heart, MessageCircle, PlusCircle, Sparkles, Star } from '../icons';
import { ScoreBadge } from './ScoreBadge';

interface RadarContactCardProps {
  contact: Contact;
  scores: CalculatedScores;
  layout: RadarCardLayout;
  onSelectContact?: () => void;
  onOpenLogModal?: () => void;
  onOpenScheduleModal?: () => void;
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

const typographyStyle = (element: RadarElementLayout): React.CSSProperties => ({
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
  onOpenScheduleModal,
  editingElement,
  onSelectElement,
  onElementPointerDown,
  onElementResizePointerDown,
}) => {
  const cat = CATEGORY_LABELS[contact.category] || CATEGORY_LABELS.conhecidos;
  const editMode = Boolean(onSelectElement);
  const lastInteraction = contact.interactions?.length
    ? [...contact.interactions].sort((a, b) => b.date.localeCompare(a.date))[0]
    : undefined;
  const conversationPrompt = lastInteraction?.nextTopicHook || contact.notes || 'Sem lembrete para a próxima conversa.';
  const progress = Math.min(100, Math.round((scores.daysSinceLastInteraction / Math.max(contact.targetIntervalDays, 1)) * 100));
  const whatsappNumber = contact.phone?.replace(/\D/g, '');

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
      <header className="radar-card-header">
        <div {...elementProps('avatar')} className={`${elementProps('avatar').className} radar-card-avatar-wrap`}>
          <div
            className="radar-card-avatar"
            style={{ backgroundColor: contact.avatarColor || '#6366f1' }}
          >
            {contact.name.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="radar-card-header-content">
          <div className="radar-card-header-top">
            <div {...elementProps('name')} className={`${elementProps('name').className} radar-card-name`} style={typographyStyle(layout.elements.name)}>
              {contact.name}
            </div>
            <div {...elementProps('status')} className={`${elementProps('status').className} radar-card-status`}>
              <ScoreBadge type="status" value={scores.status} size="sm" />
            </div>
          </div>
          <div className="radar-card-header-meta">
            <div {...elementProps('category')} className={`${elementProps('category').className} radar-card-category`} style={typographyStyle(layout.elements.category)}>
              <span className={`radar-card-category-badge ${cat.badgeBg}`}>{cat.label}</span>
              {contact.nickname && <span className="radar-card-nickname">{contact.nickname}</span>}
            </div>
          </div>
        </div>
      </header>

      <div {...elementProps('lastContact')} className={`${elementProps('lastContact').className} radar-card-conversation`} style={textStyle(layout.elements.lastContact)}>
        <div className="radar-card-conversation-top"><span><Calendar /> Última conversa:</span><strong>{formatTimeAgo(scores.daysSinceLastInteraction)}</strong></div>
        <div className="radar-card-conversation-goal"><span>Meta:</span><b>Falar a cada {contact.targetIntervalDays} {contact.targetIntervalDays === 1 ? 'dia' : 'dias'}</b>{scores.isOverdue && <em>({scores.overdueDays}d em atraso)</em>}</div>
        <div className={`radar-card-progress radar-card-progress--${scores.status}`}><i style={{ width: `${progress}%` }} /></div>
      </div>

      <div {...elementProps('scores')} className={`${elementProps('scores').className} radar-card-scores`} style={position(layout.elements.scores)}>
        <div className="radar-score-pill radar-score-pill--intimacy"><span><Sparkles /> Intimidade:</span><strong>{scores.intimacyScore.toFixed(1)}<small>/10</small></strong></div>
        <div className="radar-score-pill radar-score-pill--importance"><span><Star /> Importância:</span><strong>{contact.importanceRating}<small>/10</small></strong></div>
        <div className="radar-score-pill radar-score-pill--wellbeing"><span><Heart /> Bem-estar:</span><strong>{contact.wellbeingRating}<small>/10</small></strong></div>
        <div className="radar-score-pill radar-score-pill--priority"><span><AlertTriangle /> Prioridade:</span><strong>{scores.priorityScore}<small>%</small></strong></div>
      </div>

      <div {...elementProps('interactionCount')} className={`${elementProps('interactionCount').className} radar-card-memory`} style={textStyle(layout.elements.interactionCount)}>
        <strong>LEMBRE-SE DE PERGUNTAR:</strong><p>“{conversationPrompt}”</p>
      </div>

      <div {...elementProps('action')} className={`${elementProps('action').className} radar-card-action`} style={position(layout.elements.action)}>
        <button
          className="radar-card-primary-action"
          onClick={(event) => {
            event.stopPropagation();
            if (!editMode) onOpenLogModal?.();
          }}
          type="button"
          tabIndex={editMode ? -1 : undefined}
        >
          <PlusCircle />
          Registrar conversa
        </button>
        <button
          className="radar-card-icon-action radar-card-calendar-action"
          onClick={(event) => {
            event.stopPropagation();
            if (!editMode) onOpenScheduleModal?.();
          }}
          type="button"
          aria-label="Agendar encontro"
          tabIndex={editMode ? -1 : undefined}
        ><Calendar /></button>
        <button
          className="radar-card-icon-action radar-card-whatsapp-action"
          onClick={(event) => {
            event.stopPropagation();
            if (!editMode && whatsappNumber) window.open(`https://wa.me/${whatsappNumber}`, '_blank', 'noopener,noreferrer');
          }}
          type="button"
          aria-label={whatsappNumber ? `Abrir WhatsApp de ${contact.name}` : 'WhatsApp indisponível: telefone não cadastrado'}
          disabled={!whatsappNumber}
          tabIndex={editMode ? -1 : undefined}
        ><MessageCircle className="radar-card-whatsapp-icon" /></button>
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

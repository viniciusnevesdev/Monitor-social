import { Contact, ContactCategory } from '../types';

/**
 * Gera URL do Google Calendar para agendar uma conversa ou encontro com um amigo
 */
export function generateGoogleCalendarUrl(params: {
  name: string;
  type: string; // 'Café', 'Ligação', 'Almoço', etc.
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  notes?: string;
}): string {
  const { name, type, date, time = '15:00', notes = '' } = params;
  const title = encodeURIComponent(`${type} com ${name} (SocialSync)`);
  
  // Formatar datas para ISO compacto: YYYYMMDDTHHmmSSZ
  const startDateTime = new Date(`${date}T${time}:00`);
  const endDateTime = new Date(startDateTime.getTime() + 45 * 60 * 1000); // 45 min default
  
  const formatDate = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '');
  const dates = `${formatDate(startDateTime)}/${formatDate(endDateTime)}`;
  
  const details = encodeURIComponent(
    `Encontro agendado para manter a conexão ativa.\n${notes ? `Lembretes: ${notes}\n` : ''}Criado via SocialSync PWA.`
  );

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}`;
}

/**
 * Gera e dispara o download de um arquivo .ics compatível com Apple Calendar, Outlook e Android
 */
export function downloadIcsFile(params: {
  name: string;
  type: string;
  date: string;
  time?: string;
  notes?: string;
}) {
  const { name, type, date, time = '15:00', notes = '' } = params;
  const startDateTime = new Date(`${date}T${time}:00`);
  const endDateTime = new Date(startDateTime.getTime() + 45 * 60 * 1000);

  const formatIcsDate = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '').slice(0, 15) + 'Z';

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SocialSync PWA//Relationship Manager//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:socialsync-${Date.now()}@socialsync.app`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(startDateTime)}`,
    `DTEND:${formatIcsDate(endDateTime)}`,
    `SUMMARY:${type} com ${name}`,
    `DESCRIPTION:Encontro/conversa para manter laços saudáveis. ${notes ? `Notas: ${notes}` : ''}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `conversa-${name.toLowerCase().replace(/\s+/g, '-')}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Parser simples de contatos em formato VCF (vCard 2.1 / 3.0 / 4.0)
 */
export function parseVcfContacts(vcfContent: string): Partial<Contact>[] {
  const contacts: Partial<Contact>[] = [];
  const cards = vcfContent.split('BEGIN:VCARD');

  for (const card of cards) {
    if (!card.trim()) continue;

    let name = '';
    let phone = '';
    let email = '';

    // Extrair FN (Full Name) ou N
    const fnMatch = card.match(/FN(?:;[^:]+)?:([^\r\n]+)/i);
    if (fnMatch) {
      name = fnMatch[1].trim();
    } else {
      const nMatch = card.match(/N(?:;[^:]+)?:([^\r\n]+)/i);
      if (nMatch) {
        const parts = nMatch[1].split(';').filter(Boolean);
        name = parts.reverse().join(' ').trim();
      }
    }

    // Extrair TEL
    const telMatch = card.match(/TEL(?:;[^:]+)?:([^\r\n]+)/i);
    if (telMatch) {
      phone = telMatch[1].trim();
    }

    // Extrair EMAIL
    const emailMatch = card.match(/EMAIL(?:;[^:]+)?:([^\r\n]+)/i);
    if (emailMatch) {
      email = emailMatch[1].trim();
    }

    if (name) {
      contacts.push({
        name,
        phone: phone || undefined,
        email: email || undefined,
        category: 'amigos_proximos' as ContactCategory,
        importanceRating: 8,
        wellbeingRating: 8,
        targetIntervalDays: 14,
        reminderEnabled: true,
      });
    }
  }

  return contacts;
}

/**
 * Chama a Web Contact Picker API nativa (em dispositivos móveis compatíveis)
 */
export async function pickDeviceContacts(): Promise<Partial<Contact>[] | null> {
  if ('contacts' in navigator && 'ContactsManager' in window) {
    try {
      const props = ['name', 'tel', 'email'];
      const opts = { multiple: true };
      const selected = await (navigator as any).contacts.select(props, opts);
      if (Array.isArray(selected) && selected.length > 0) {
        return selected.map((item: any) => ({
          name: Array.isArray(item.name) ? item.name[0] : item.name || 'Sem nome',
          phone: Array.isArray(item.tel) ? item.tel[0] : item.tel || undefined,
          email: Array.isArray(item.email) ? item.email[0] : item.email || undefined,
          category: 'amigos_proximos' as ContactCategory,
          importanceRating: 8,
          wellbeingRating: 8,
          targetIntervalDays: 14,
          reminderEnabled: true,
        }));
      }
    } catch (err) {
      console.warn('Contact picker não foi autorizado ou cancelado:', err);
    }
  }
  return null;
}

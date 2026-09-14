import React, { useEffect, useState } from 'react';
import { Contact } from '../types';

interface ContactAvatarProps {
  contact: Pick<Contact, 'name' | 'avatarColor' | 'avatarImage'>;
  className?: string;
  children?: React.ReactNode;
  title?: string;
}

export const ContactAvatar: React.FC<ContactAvatarProps> = ({
  contact,
  className = '',
  children,
  title,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [contact.avatarImage]);

  const initial = contact.name.trim().charAt(0).toUpperCase() || '?';
  const showImage = Boolean(contact.avatarImage) && !imageFailed;

  return (
    <div
      className={`relative flex items-center justify-center text-white font-bold ${className}`.trim()}
      style={{ backgroundColor: contact.avatarColor || '#6366f1' }}
      title={title}
    >
      <span
        className="absolute inset-0 block overflow-hidden pointer-events-none"
        style={{ borderRadius: 'inherit' }}
        aria-hidden="true"
      >
        {showImage ? (
          <img
            src={contact.avatarImage}
            alt=""
            className="block w-full h-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="grid w-full h-full place-items-center">{initial}</span>
        )}
      </span>
      {children}
    </div>
  );
};

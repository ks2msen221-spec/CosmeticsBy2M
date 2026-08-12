import React from 'react';
import { CONTACT_CONFIG } from '../config/contact';
import { WhatsAppIcon } from './WhatsAppFloatButton';

function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.891h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  );
}

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  );
}

function TikTokIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 2.13 6.395 6.395 0 0 0 1.326 8.78 6.331 6.331 0 0 0 8.286-.96 6.386 6.386 0 0 0 1.346-4.045v-6.93a8.163 8.163 0 0 0 4.767 1.52v-3.5a4.773 4.773 0 0 1-1.096-.213z" />
    </svg>
  );
}

interface SocialIconsProps {
  iconClassName?: string;
  containerClassName?: string;
  showLabels?: boolean;
}

export function SocialIcons({ 
  iconClassName = "w-4 h-4", 
  containerClassName = "flex items-center gap-3",
  showLabels = false
}: SocialIconsProps) {
  const links = [
    {
      name: 'Facebook',
      url: CONTACT_CONFIG.facebookUrl,
      icon: <FacebookIcon className={iconClassName} />,
      hoverColor: 'hover:text-[#1877F2]'
    },
    {
      name: 'Instagram',
      url: CONTACT_CONFIG.instagramUrl,
      icon: <InstagramIcon className={iconClassName} />,
      hoverColor: 'hover:text-[#E4405F]'
    },
    {
      name: 'TikTok',
      url: CONTACT_CONFIG.tiktokUrl,
      icon: <TikTokIcon className={iconClassName} />,
      hoverColor: 'hover:text-[#00F2FE]'
    },
    {
      name: 'WhatsApp',
      url: CONTACT_CONFIG.whatsappDirectUrl,
      icon: <WhatsAppIcon className={iconClassName} />,
      hoverColor: 'hover:text-[#25D366]'
    }
  ];

  return (
    <div className={containerClassName}>
      {links.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Suivez 2M Cosmetics sur ${link.name}`}
          className={`transition-colors text-black/70 ${link.hoverColor} flex items-center gap-1.5 text-xs p-1 hover:scale-110 transition-transform`}
          title={`Suivez-nous sur ${link.name}`}
        >
          {link.icon}
          {showLabels && <span className="font-medium text-[11px]">{link.name}</span>}
        </a>
      ))}
    </div>
  );
}

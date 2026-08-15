import React from 'react';
import { CONTACT_CONFIG } from '../config/contact';

export function WhatsAppIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12.011 1.001c-6.066 0-10.98 4.914-10.98 10.98 0 1.939.504 3.834 1.464 5.503l-1.558 5.69 5.823-1.527c1.611.88 3.425 1.343 5.251 1.343 6.066 0 10.98-4.914 10.98-10.98 0-6.066-4.914-10.98-10.98-10.98zm0 2.001c4.962 0 8.98 4.018 8.98 8.98 0 4.962-4.018 8.98-8.98 8.98-1.559 0-3.084-.405-4.43-1.17l-.317-.18-3.284.861.876-3.2-.197-.313c-.841-1.336-1.288-2.884-1.288-4.478 0-4.962 4.018-8.98 8.98-8.98zm-3.666 4.793c-.198 0-.522.074-.795.372-.273.298-1.042 1.018-1.042 2.483 0 1.465 1.066 2.88 1.215 3.078.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.174-1.413-.074-.124-.273-.198-.571-.347-.298-.149-1.758-.868-2.031-.967-.273-.099-.471-.149-.669.149-.198.298-.769.967-.943 1.165-.174.198-.347.223-.645.074-.298-.149-1.26-.464-2.401-1.482-.888-.791-1.487-1.768-1.661-2.066-.174-.298-.018-.459.131-.607.134-.133.298-.347.446-.521.149-.174.198-.298.298-.496.099-.198.05-.372-.025-.521-.074-.149-.669-1.611-.917-2.207-.242-.579-.487-.501-.669-.51l-.571-.01z" />
    </svg>
  );
}

interface WhatsAppFloatButtonProps {
  hidden?: boolean;
}

export default function WhatsAppFloatButton({ hidden = false }: WhatsAppFloatButtonProps) {
  if (hidden) return null;

  return (
    <a
      href={CONTACT_CONFIG.whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Discuter avec nous sur WhatsApp"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 group flex items-center gap-2 bg-[#25D366] text-white p-3.5 rounded-full shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
      title="Contactez-nous sur WhatsApp"
    >
      <WhatsAppIcon className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs font-semibold tracking-wide pr-1">
        Discuter sur WhatsApp
      </span>
    </a>
  );
}

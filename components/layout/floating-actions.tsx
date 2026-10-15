'use client';

import type { ReactNode } from 'react';

import { FloatingMapButton } from '@/components/map/floating-map-button';
import { useMap } from '@/components/map/map-provider';
import { instagramUrl, whatsappUrl } from '@/lib/contact-links';

/** Accesos directos, con el mismo tamaño y lenguaje visual del mapa. */
export function FloatingActions({ whatsapp, instagram }: { whatsapp: string; instagram: string }) {
  const { isOpen } = useMap();
  const whatsappHref = whatsappUrl(whatsapp);
  const instagramHref = instagramUrl(instagram);

  return (
    <nav
      aria-label="Accesos rápidos de Araceli"
      className="pointer-events-none fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))] z-50 flex flex-col items-end gap-2.5"
    >
      {!isOpen && instagramHref ? (
        <ContactButton href={instagramHref} label="Ver el Instagram de Araceli" tooltip={`Instagram · ${instagram}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" className="h-6 w-6">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
          </svg>
        </ContactButton>
      ) : null}
      {!isOpen && whatsappHref ? (
        <ContactButton href={whatsappHref} label="Escribir a Araceli por WhatsApp" tooltip="Conversar por WhatsApp">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-7 w-7 text-emerald-700">
            <path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.5L3 20.7l1.5-4.8a8.5 8.5 0 1 1 16-4.2Z" />
            <path d="M8.5 7.5c-.5 0-1 .7-1 1.4 0 2.7 4.2 6.9 6.9 6.9.8 0 1.6-.7 1.6-1.2 0-.3-1.8-1.2-2.1-1.2-.3 0-.7.7-1 .8-.7.1-3.3-2.4-3.2-3.1.1-.3.8-.6.8-1 0-.3-1.3-2.6-1.5-2.6h-.5Z" />
          </svg>
        </ContactButton>
      ) : null}
      <FloatingMapButton />
    </nav>
  );
}

function ContactButton({ href, label, tooltip, children }: {
  href: string; label: string; tooltip: string; children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} (abre en otra pestaña)`}
      className="glass group pointer-events-auto relative flex h-[54px] w-[54px] items-center justify-center rounded-[17px] text-primary shadow-glass transition-[transform,box-shadow,border-color] duration-300 ease-calm hover:-translate-y-[2px] hover:border-primary/30 focus-visible:-translate-y-[2px]"
    >
      {children}
      <span aria-hidden="true" className="pointer-events-none absolute right-[66px] hidden whitespace-nowrap rounded-full border border-ink/8 bg-ivory-paper/95 px-4 py-2 text-sm text-ink-600 opacity-0 shadow-soft backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 sm:block">
        {tooltip}
      </span>
    </a>
  );
}

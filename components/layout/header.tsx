'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { useMap } from '@/components/map/map-provider';
import { RippleMark } from '@/components/visual/ripple-mark';
import { useFocusTrap } from '@/lib/hooks/use-focus-trap';
import { useLockScroll } from '@/lib/hooks/use-lock-scroll';
import { usePresence } from '@/lib/hooks/use-presence';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { cn } from '@/lib/utils/cn';

type NavLink = { label: string; href: string };

export function Header({ nav, brandName }: { nav: NavLink[]; brandName: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const menuRef = useRef<HTMLDivElement>(null);
  const { open } = useMap();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const { mounted: menuMounted, visible: menuVisible } = usePresence(menuOpen, reducedMotion ? 0 : 260);

  useLockScroll(menuOpen);
  useFocusTrap(menuRef, menuMounted && menuOpen, () => setMenuOpen(false));

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-all duration-500 ease-calm',
        scrolled ? 'border-b border-ink/6 bg-ivory-paper/85 backdrop-blur-xl' : 'border-b border-transparent',
      )}
    >
      <div className="shell flex h-[68px] items-center justify-between gap-6">
        <Link href="/" className="group flex items-center gap-3 rounded-full py-1 pr-3">
          <RippleMark className="h-7 w-7 text-primary transition-transform duration-700 ease-calm group-hover:scale-105" />
          <span className="font-serif text-[1.2rem] font-light tracking-tight text-ink-800">{brandName}</span>
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-8 md:flex">
          {nav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'link-underline text-sm transition-colors duration-300',
                pathname === link.href ? 'text-primary' : 'text-ink-500 hover:text-ink-800',
              )}
            >
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => open('section')}
            className="rounded-full border border-ink/12 px-4 py-2 text-sm text-ink-700 transition-all duration-300 ease-calm hover:border-primary/40 hover:text-primary"
          >
            Crear mi mapa
          </button>
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          className="flex h-11 w-11 items-center justify-center rounded-full text-ink-600 transition-colors hover:bg-ink/5 md:hidden"
        >
          <span className="sr-only">{menuOpen ? 'Cerrar menú' : 'Abrir menú'}</span>
          <span aria-hidden className="relative block h-3 w-5">
            <span
              className={cn(
                'absolute left-0 block h-px w-5 bg-current transition-all duration-400 ease-calm',
                menuOpen ? 'top-1.5 rotate-45' : 'top-0',
              )}
            />
            <span
              className={cn(
                'absolute left-0 block h-px w-5 bg-current transition-all duration-400 ease-calm',
                menuOpen ? 'top-1.5 -rotate-45' : 'top-3',
              )}
            />
          </span>
        </button>
      </div>

      {menuMounted ? (
        <div
          ref={menuRef}
          id="mobile-menu"
          className={cn(
            'border-t border-ink/6 bg-ivory-paper/97 px-5 pb-8 pt-4 backdrop-blur-xl transition-all duration-300 ease-calm md:hidden',
            menuVisible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0',
          )}
        >
            <nav aria-label="Menú móvil" className="flex flex-col">
              {nav.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex min-h-[52px] items-center border-b border-ink/6 text-[1.05rem] text-ink-700"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                open('section');
              }}
              className="mt-6 flex min-h-[52px] w-full items-center justify-center rounded-full bg-ink-800 text-sm text-ivory"
            >
              Crear mi mapa
            </button>
        </div>
      ) : null}
    </header>
  );
}

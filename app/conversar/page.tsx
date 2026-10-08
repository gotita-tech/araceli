import type { Metadata } from 'next';

import { Button } from '@/components/ui/button';
import { StaticRipples } from '@/components/visual/static-ripples';
import { EditorialImage } from '@/components/visual/editorial-image';
import { site } from '@/lib/content';
import { DISCLAIMERS } from '@/lib/recommender/safety-rules';

export const metadata: Metadata = {
  alternates: { canonical: '/conversar' },
  title: 'Conversar con Araceli',
  description:
    'Una conversación breve para resolver dudas y decidir juntos qué experiencia puede encajar mejor con tu momento.',
};

type Channel = { label: string; value: string; href: string };

export default function ContactPage() {
  const { contact } = site;

  const channels: Channel[] = [
    contact.whatsapp
      ? { label: 'WhatsApp', value: contact.whatsapp, href: `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, '')}` }
      : null,
    contact.email ? { label: 'Correo', value: contact.email, href: `mailto:${contact.email}` } : null,
    contact.instagram
      ? {
          label: 'Instagram',
          value: contact.instagram,
          href: `https://instagram.com/${contact.instagram.replace('@', '')}`,
        }
      : null,
    contact.bookingUrl ? { label: 'Agenda', value: 'Reservar una hora', href: contact.bookingUrl } : null,
  ].filter((channel): channel is Channel => channel !== null);

  return (
    <div className="relative overflow-hidden bg-ivory-paper pb-24 pt-[68px]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[380px] opacity-50" aria-hidden>
        <StaticRipples />
      </div>

      <div className="shell relative py-16 md:py-24">
        <div className="max-w-2xl">
          <p className="eyebrow">Conversar</p>
          <h1 className="mt-5 font-serif text-display font-extralight leading-[1.05] text-ink-900">
            Empecemos por una conversación.
          </h1>
          <p className="mt-7 text-lede text-ink-500">
            No hace falta llegar con un objetivo cerrado ni saber qué modalidad elegir. Una conversación breve suele ser
            suficiente para decidir cómo empezar.
          </p>
        </div>

        <EditorialImage id="liberacion-emociones" className="mt-12 h-[240px] md:h-[340px]" sizes="100vw" caption />
        {channels.length > 0 ? (
          <div className="mt-14 grid max-w-3xl gap-4 sm:grid-cols-2">
            {channels.map((channel) => (
              <a
                key={channel.label}
                href={channel.href}
                className="group rounded-[1.75rem] border border-ink/8 bg-white/70 p-7 transition-all duration-400 ease-calm hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-soft"
              >
                <p className="eyebrow">{channel.label}</p>
                <p className="mt-3 break-words text-[1.05rem] text-ink-700">{channel.value}</p>
              </a>
            ))}
          </div>
        ) : (
          <div className="mt-14 max-w-2xl rounded-[1.75rem] border border-primary/20 bg-primary/5 p-8">
            <p className="text-[1.05rem] leading-relaxed text-ink-700">
              Los canales de contacto se activarán en cuanto estén confirmados. Mientras tanto puedes recorrer las
              prácticas o crear tu Mapa Interior: al terminar tendrás una idea clara de qué te gustaría explorar.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button href="/mapa-interior">Descubrir mi Mapa Interior</Button>
              <Button href="/practicas" variant="secondary">
                Ver las prácticas
              </Button>
            </div>
          </div>
        )}

        <p className="mt-14 max-w-3xl text-xs leading-relaxed text-ink-300">{DISCLAIMERS.global}</p>
      </div>
    </div>
  );
}

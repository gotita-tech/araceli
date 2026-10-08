import Image from 'next/image';
import { about } from '@/lib/content';

/** La fotografía original se encuadra por CSS, sin alterar el rostro. */
export function AuthenticPortrait({ priority = false }: { priority?: boolean }) {
  if (about.portrait.status !== 'published' || !about.portrait.src) return null;
  return (
    <figure>
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem]">
        <Image src={about.portrait.src} alt={about.portrait.alt} fill sizes="(max-width: 768px) 100vw, 50vw" priority={priority} className="object-cover object-top" />
      </div>
      <figcaption className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-ink-400">
        <span>Araceli · Tiempo Interior</span>
        <a className="link-underline" href="https://www.instagram.com/araceli_terapias/p/DcG2DqkxH3O/">Fotografía de su perfil ↗</a>
      </figcaption>
    </figure>
  );
}

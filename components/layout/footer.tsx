import Link from 'next/link';

import Image from 'next/image';
import { site } from '@/lib/content';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ink/8 bg-ivory-soft">
      <div className="shell py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <Image src="/images/tiempo-interior-logo.webp" alt="" width={38} height={38} className="rounded-full" />
              <span className="font-serif text-[1.2rem] font-light text-ink-800">{site.brand.name}</span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-400">{site.brand.tagline}</p>
          </div>

          <div className="flex flex-col gap-4 md:items-end">
            <nav aria-label="Pie de página" className="flex flex-wrap gap-x-7 gap-y-4">
              {site.footer.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="link-underline link-inline text-sm text-ink-500 transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <a href="https://wa.me/56982895351" className="link-underline text-sm text-primary">WhatsApp · +56 9 8289 5351 ↗</a>
          </div>
        </div>

        <div className="hairline my-12" />

        <p className="max-w-3xl text-xs leading-relaxed text-ink-300">{site.footer.note}</p>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-ink-300">
          <span>
            © {year} {site.brand.name}
          </span>
          <span>{site.footer.credit}</span>
        </div>
      </div>
    </footer>
  );
}

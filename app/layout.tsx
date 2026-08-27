import type { Metadata, Viewport } from 'next';
import { Inter, Newsreader } from 'next/font/google';

import { FloatingMapButton } from '@/components/map/floating-map-button';
import { MapModal } from '@/components/map/map-modal';
import { MapProvider } from '@/components/map/map-provider';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { SkipLink } from '@/components/layout/skip-link';
import { site } from '@/lib/content';
import { isProductionDeployment, siteUrl } from '@/lib/site-url';

import './globals.css';

/** Dos familias, ni una más: serif editorial para la voz, sans para la interfaz. */
const display = Newsreader({
  subsets: ['latin'],
  weight: ['200', '300', '400'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const ui = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-ui',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  alternates: { canonical: '/' },
  title: {
    default: `${site.brand.name} · Tu Mapa Interior`,
    template: `%s · ${site.brand.name}`,
  },
  description: site.brand.shortDescription,
  applicationName: `${site.brand.name} · Tu Mapa Interior`,
  keywords: ['bienestar', 'crecimiento personal', 'prácticas complementarias', 'Reiki', 'ThetaHealing', 'meditación'],
  authors: [{ name: site.brand.name }],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    title: `${site.brand.name} · Tu Mapa Interior`,
    description: site.brand.shortDescription,
    siteName: site.brand.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.brand.name} · Tu Mapa Interior`,
    description: site.brand.shortDescription,
  },
  robots: {
    // Las previsualizaciones de despliegue no se indexan.
    index: isProductionDeployment,
    follow: isProductionDeployment,
  },
};

export const viewport: Viewport = {
  themeColor: '#FBFBF4',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: `${site.brand.name} · Tu Mapa Interior`,
      url: siteUrl,
      inLanguage: 'es',
      description: site.brand.shortDescription,
    },
    {
      '@type': 'Person',
      name: site.brand.name,
      jobTitle: site.brand.practitionerRole,
      description: site.brand.tagline,
      url: siteUrl,
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${ui.variable}`}>
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          // Datos estructurados factuales: nada de afirmaciones sobre resultados.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {/* Sin JavaScript, el contenido que aparece con animación debe verse igual. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
        <MapProvider>
          <SkipLink />
          <Header nav={site.nav} brandName={site.brand.name} />
          <main id="contenido" className="min-h-screen">
            {children}
          </main>
          <Footer />
          <FloatingMapButton />
          <MapModal />
        </MapProvider>
      </body>
    </html>
  );
}

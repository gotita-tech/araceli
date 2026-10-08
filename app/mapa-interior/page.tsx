import type { Metadata } from 'next';

import { MapPage } from '@/components/map/map-page';

export const metadata: Metadata = {
  alternates: { canonical: '/mapa-interior' },
  title: 'Tu Mapa Interior',
  description:
    'Nueve preguntas sencillas para descubrir qué modalidades de bienestar tienen mayor afinidad con aquello que hoy te interesa explorar. Sin diagnóstico y sin datos personales.',
};

export default function Page() {
  return <MapPage />;
}

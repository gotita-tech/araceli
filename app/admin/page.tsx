import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { AdminStudio } from '@/components/admin/admin-studio';
import { adminEnabled } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Administración de contenido',
  robots: { index: false, follow: false },
};

/**
 * Se evalúa en cada petición para poder activar o desactivar el estudio desde
 * las variables de entorno sin volver a desplegar.
 */
export const dynamic = 'force-dynamic';

export default function AdminPage() {
  // En un despliegue público el estudio permanece oculto salvo que se active
  // explícitamente: contiene notas internas que no son contenido publicable.
  if (!adminEnabled) notFound();

  return <AdminStudio />;
}

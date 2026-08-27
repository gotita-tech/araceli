/**
 * Analítica respetuosa con la privacidad.
 *
 * Por defecto no hace nada. Si en el futuro se conecta un proveedor sin cookies,
 * este módulo es el único punto de integración y debe seguir respetando:
 * - señales Do Not Track y Global Privacy Control,
 * - ausencia total de identificadores personales,
 * - ausencia de publicidad comportamental.
 */
export type AnalyticsEvent =
  | { name: 'map_opened'; source: 'hero' | 'floating' | 'page' | 'section' }
  | { name: 'map_step'; step: number }
  | { name: 'map_completed'; confidence: 'low' | 'medium' | 'high' }
  | { name: 'map_safety_routed'; level: 'clinical' | 'urgent' }
  | { name: 'modality_viewed'; id: string };

type NavigatorWithPrivacy = Navigator & { globalPrivacyControl?: boolean; doNotTrack?: string };

export function analyticsAllowed(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as NavigatorWithPrivacy;
  if (nav.globalPrivacyControl) return false;
  const dnt = nav.doNotTrack ?? (window as unknown as { doNotTrack?: string }).doNotTrack;
  return dnt !== '1' && dnt !== 'yes';
}

export function track(event: AnalyticsEvent): void {
  if (typeof window === 'undefined') return;
  if (!analyticsAllowed()) return;
  if (process.env.NODE_ENV !== 'production') {
    // En desarrollo se registran en consola para poder revisarlos.
    console.debug('[analytics]', event.name, event);
  }
  // Punto de integración: enviar a un proveedor sin cookies ni identificadores.
}

/** Enlaces públicos; no abren conversaciones ni envían mensajes automáticamente. */
export function whatsappUrl(value: string): string | null {
  const number = value.replace(/[^0-9]/g, '');
  return number ? `https://wa.me/${number}` : null;
}

export function instagramUrl(value: string): string | null {
  const handle = value.trim().replace(/^@/, '');
  return handle ? `https://www.instagram.com/${encodeURIComponent(handle)}/` : null;
}

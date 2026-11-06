// Protection par mot de passe unique (usage personnel).
// Active seulement si APP_PASSWORD est défini ; en local sans variable, l'app reste ouverte.
export const AUTH_COOKIE = "socle_session";

export function authEnabled() {
  return !!process.env.APP_PASSWORD;
}

/** Jeton de session dérivé du mot de passe : changer APP_PASSWORD déconnecte tous les appareils. */
export async function sessionToken() {
  const data = new TextEncoder().encode(`socle:${process.env.APP_PASSWORD}:${process.env.AUTH_SECRET ?? ""}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Comparaison en temps constant. */
export function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, authEnabled, safeEqual, sessionToken } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  if (!authEnabled()) return NextResponse.next();
  const cookie = req.cookies.get(AUTH_COOKIE)?.value ?? "";
  if (cookie && safeEqual(cookie, await sessionToken())) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = "/connexion";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  // Tout est protégé sauf la page de connexion, les fichiers Next et les icônes nécessaires à l'écran d'accueil iPhone.
  matcher: ["/((?!connexion|_next/static|_next/image|favicon.ico|manifest.webmanifest|apple-icon|icon).*)"],
};

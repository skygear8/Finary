"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE, safeEqual, sessionToken } from "@/lib/auth";

export async function login(_prev: string | null, f: FormData): Promise<string | null> {
  const pwd = String(f.get("password") ?? "");
  const expected = process.env.APP_PASSWORD ?? "";
  if (!expected || !safeEqual(pwd, expected)) {
    await new Promise((r) => setTimeout(r, 1500)); // freine les essais en rafale
    return "Mot de passe incorrect.";
  }
  (await cookies()).set(AUTH_COOKIE, await sessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
  redirect("/");
}

export async function logout() {
  (await cookies()).delete(AUTH_COOKIE);
  redirect("/connexion");
}

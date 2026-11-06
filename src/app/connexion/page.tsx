"use client";
import { useActionState } from "react";
import { login } from "./actions";

export default function Connexion() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <div className="mx-auto max-w-sm py-20">
      <h1 className="text-2xl font-semibold"><span className="text-accent">▲</span> Socle</h1>
      <p className="mt-1 text-sm text-muted">Accès privé</p>
      <form action={action} className="mt-6 space-y-3">
        <input className="input" type="password" name="password" placeholder="Mot de passe" autoComplete="current-password" autoFocus required />
        <button className="btn w-full" disabled={pending}>{pending ? "Vérification…" : "Se connecter"}</button>
        {error && <p className="text-sm text-rose-600">{error}</p>}
      </form>
    </div>
  );
}

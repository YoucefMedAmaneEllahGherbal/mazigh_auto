"use client";

import { useActionState } from "react";
import { CircleAlert, Loader2 } from "lucide-react";
import { signInAction, type SignInState } from "./actions";

const initialState: SignInState = null;

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(signInAction, initialState);

  return (
    <form action={formAction} className="adm-auth-form">
      <div className="adm-field">
        <label htmlFor="admin-email" className="adm-label">
          Adresse e-mail
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="adm-input"
        />
      </div>

      <div className="adm-field">
        <label htmlFor="admin-password" className="adm-label">
          Mot de passe
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="adm-input"
        />
      </div>

      {state?.error && (
        <p className="adm-alert is-error" role="alert">
          <CircleAlert aria-hidden="true" />
          {state.error}
        </p>
      )}

      <button className="adm-btn is-primary is-lg is-block" disabled={isPending}>
        {isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {isPending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}

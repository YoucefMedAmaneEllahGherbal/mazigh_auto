"use client";

import { useActionState } from "react";
import { signInAction, type SignInState } from "./actions";

const initialState: SignInState = null;

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    signInAction,
    initialState,
  );

  return (
    <form action={formAction} className="admin-login-form">
      <div className="admin-form-field">
        <label htmlFor="admin-email">Adresse e-mail</label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          required
        />
      </div>

      <div className="admin-form-field">
        <label htmlFor="admin-password">Mot de passe</label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      {state?.error && (
        <p className="admin-form-error" role="alert">
          {state.error}
        </p>
      )}

      <button className="primary-button admin-submit-button" disabled={isPending}>
        {isPending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
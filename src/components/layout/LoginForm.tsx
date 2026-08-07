"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/actions/auth-actions";
import { inputCls } from "@/components/ui/Field";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: "#FBEAEA", color: "#B23A48" }}>
          {state.error}
        </div>
      )}
      <div>
        <label className="block text-xs font-semibold mb-1 text-slate">Email</label>
        <input name="email" type="email" required autoFocus className={inputCls} />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1 text-slate">Password</label>
        <input name="password" type="password" required className={inputCls} />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full px-4 py-2 rounded text-sm font-semibold text-white disabled:opacity-60"
        style={{ backgroundColor: "#3D2645" }}
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

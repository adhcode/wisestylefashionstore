"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Field, inputCls } from "@/components/ui/Field";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { createUserAccount, deleteUserAccount } from "@/actions/user-actions";
import { ROLES, type Role } from "@/domain/entities";
import type { UserAccount } from "@/data/user-repository";
import type { Tailor } from "@/domain/entities";

export function UserAccountsPanel({ users, tailors }: { users: UserAccount[]; tailors: Tailor[] }) {
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("MANAGER");
  const [password, setPassword] = useState("");
  const [tailorId, setTailorId] = useState("");
  const [pending, startTransition] = useTransition();

  const linkedTailorIds = new Set(users.filter((u) => u.tailorId).map((u) => u.tailorId));
  const availableTailors = tailors.filter((t) => !linkedTailorIds.has(t.id));

  const submit = () => {
    if (role === "TAILOR" && !tailorId) {
      setErrors(["Choose which tailor this login belongs to."]);
      return;
    }
    setErrors([]);
    startTransition(async () => {
      const result = await createUserAccount({
        email,
        name,
        role,
        password,
        tailorId: role === "TAILOR" ? tailorId : null,
      });
      if (!result.success) {
        setErrors([result.error]);
        return;
      }
      setEmail("");
      setName("");
      setPassword("");
      setTailorId("");
      setRole("MANAGER");
      setShowForm(false);
    });
  };

  const remove = (id: string) => {
    startTransition(async () => {
      await deleteUserAccount(id);
      setDeletingId(null);
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-ink font-serif">User Accounts</h1>
          <p className="text-sm text-slate">{users.length} account(s) — manage manager and tailor logins</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold text-white"
          style={{ backgroundColor: "#3D2645" }}
        >
          <Plus size={16} /> New Account
        </button>
      </div>

      <div className="bg-white rounded-lg border border-line overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: "#F7F2E8" }}>
              {["Name", "Email", "Role", "Linked Tailor", ""].map((h) => (
                <th key={h} className="text-left px-3 py-2 font-semibold text-slate">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-line">
                <td className="px-3 py-2 font-semibold">{u.name}</td>
                <td className="px-3 py-2">{u.email}</td>
                <td className="px-3 py-2">{u.role}</td>
                <td className="px-3 py-2">{u.tailorName ?? "—"}</td>
                <td className="px-3 py-2">
                  <button onClick={() => setDeletingId(u.id)} className="p-1 rounded hover:bg-gray-100">
                    <Trash2 size={15} color="#B23A48" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal title="New User Account" onClose={() => setShowForm(false)}>
          <ErrorBanner messages={errors} />
          <Field label="Full Name *">
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Email *">
            <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Password *">
            <input type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <Field label="Role">
            <select className={inputCls} value={role} onChange={(e) => setRole(e.target.value as Role)}>
              {ROLES.filter((r) => r !== "ADMIN").map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </Field>
          {role === "TAILOR" && (
            <Field label="Linked Tailor *">
              <select className={inputCls} value={tailorId} onChange={(e) => setTailorId(e.target.value)}>
                <option value="">Select a tailor…</option>
                {availableTailors.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.tailorNumber})
                  </option>
                ))}
              </select>
              {availableTailors.length === 0 && (
                <p className="text-xs mt-1 text-slate">Every tailor already has a login, or none exist yet — add one from the Tailors page.</p>
              )}
            </Field>
          )}
          <div className="flex justify-end gap-2 pt-3 border-t border-line">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded text-sm font-semibold text-slate">
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={pending}
              className="px-4 py-2 rounded text-sm font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: "#3D2645" }}
            >
              {pending ? "Creating…" : "Create Account"}
            </button>
          </div>
        </Modal>
      )}

      {deletingId && (
        <Modal title="Delete Account" onClose={() => setDeletingId(null)}>
          <p className="text-sm text-ink mb-4">Are you sure you want to delete this account? This cannot be undone.</p>
          <div className="flex justify-end gap-2">
            <button onClick={() => setDeletingId(null)} className="px-4 py-2 rounded text-sm font-semibold text-slate">
              Cancel
            </button>
            <button
              onClick={() => remove(deletingId)}
              disabled={pending}
              className="px-4 py-2 rounded text-sm font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: "#B23A48" }}
            >
              {pending ? "Deleting…" : "Delete"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

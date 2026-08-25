"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Users, Shield, UserCog } from "lucide-react";
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

  const admins = users.filter(u => u.role === "ADMIN");
  const managers = users.filter(u => u.role === "MANAGER");
  const tailorUsers = users.filter(u => u.role === "TAILOR");

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
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Accounts</h1>
            <p className="text-sm text-gray-600">{users.length} account{users.length !== 1 ? "s" : ""} — manage manager and tailor logins</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={18} />
            New Account
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Shield className="text-red-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{admins.length}</p>
              <p className="text-sm text-gray-600">Administrators</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <UserCog className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{managers.length}</p>
              <p className="text-sm text-gray-600">Managers</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{tailorUsers.length}</p>
              <p className="text-sm text-gray-600">Tailor Accounts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Linked Tailor
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                    No user accounts yet. Add your first account!
                  </td>
                </tr>
              )}
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                      u.role === "ADMIN" ? "bg-red-100 text-red-700" :
                      u.role === "MANAGER" ? "bg-blue-100 text-blue-700" :
                      "bg-purple-100 text-purple-700"
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{u.tailorName ?? "—"}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end">
                      <button 
                        onClick={() => setDeletingId(u.id)} 
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete user"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {users.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              Showing {users.length} user account{users.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>

      {/* Create Account Modal */}
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
                <p className="text-xs mt-1 text-gray-500">Every tailor already has a login, or none exist yet — add one from the Tailors page.</p>
              )}
            </Field>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button" 
              onClick={() => setShowForm(false)} 
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={pending}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium disabled:opacity-60 transition-colors"
            >
              {pending ? "Creating…" : "Create Account"}
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <Modal title="Delete Account" onClose={() => setDeletingId(null)}>
          <p className="text-sm text-gray-700 mb-6">
            Are you sure you want to delete this account? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button 
              onClick={() => setDeletingId(null)} 
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => remove(deletingId)}
              disabled={pending}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-60 transition-colors"
            >
              {pending ? "Deleting…" : "Delete Account"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth-service";
import { LoginForm } from "@/components/layout/LoginForm";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">WiseStyle</h1>
          <p className="text-sm text-gray-600 mt-2">Fashion House Operations</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Sign in to your account</h2>
          <LoginForm />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          © {new Date().getFullYear()} WiseStyle Fashion House. All rights reserved.
        </p>
      </div>
    </div>
  );
}

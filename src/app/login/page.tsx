import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth-service";
import { LoginForm } from "@/components/layout/LoginForm";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FAF7F1" }}>
      <div className="w-full max-w-sm bg-white rounded-lg border border-line p-8">
        <p className="text-2xl font-bold text-ink font-serif">WiseStyle</p>
        <p className="text-xs mb-6" style={{ color: "#C9973E" }}>
          Fashion House Operations
        </p>
        <LoginForm />
      </div>
    </div>
  );
}

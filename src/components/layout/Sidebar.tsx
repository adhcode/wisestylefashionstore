"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  UserCog,
  Landmark,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { logoutAction } from "@/actions/auth-actions";
import type { Role } from "@/domain/entities";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: Role[];
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "MANAGER", "TAILOR"] },
  { href: "/jobs", label: "Jobs", icon: Briefcase, roles: ["ADMIN", "MANAGER", "TAILOR"] },
  { href: "/customers", label: "Customers", icon: Users, roles: ["ADMIN", "MANAGER"] },
  { href: "/tailors", label: "Tailors", icon: UserCog, roles: ["ADMIN", "MANAGER"] },
  { href: "/payments", label: "Payments & Receipts", icon: Landmark, roles: ["ADMIN", "MANAGER"] },
  { href: "/admin/users", label: "User Accounts", icon: ShieldCheck, roles: ["ADMIN"] },
];

export function Sidebar({ role, name }: { role: Role; name: string }) {
  const pathname = usePathname();
  const items = NAV.filter((item) => item.roles.includes(role));

  return (
    <div className="flex flex-col justify-between w-56 shrink-0" style={{ backgroundColor: "#2E1A38" }}>
      <div>
        <div className="p-5">
          <p className="text-white font-bold text-xl font-serif">WiseStyle</p>
          <p className="text-xs mt-1" style={{ color: "#E4C377" }}>
            Fashion House Operations
          </p>
        </div>
        <nav className="mt-4">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 w-full text-left px-5 py-3 text-sm"
                style={{
                  color: active ? "#2E1A38" : "#EDE6F0",
                  backgroundColor: active ? "#C9973E" : "transparent",
                  fontWeight: active ? 700 : 500,
                }}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 text-xs">
        <p style={{ color: "#9C8CA6" }}>
          Signed in as {name} · {role.charAt(0) + role.slice(1).toLowerCase()}
        </p>
        <form action={logoutAction}>
          <button type="submit" className="mt-2 underline" style={{ color: "#9C8CA6" }}>
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

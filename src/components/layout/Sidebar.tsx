"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  UserCog,
  Landmark,
  ShieldCheck,
  Package,
  UserPlus,
  LogOut,
  Menu,
  X,
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
  { href: "/referrals", label: "Referrals", icon: UserPlus, roles: ["ADMIN", "MANAGER"] },
  { href: "/payments", label: "Payments", icon: Landmark, roles: ["ADMIN", "MANAGER"] },
  { href: "/materials", label: "Materials", icon: Package, roles: ["ADMIN"] },
  { href: "/admin/users", label: "Users", icon: ShieldCheck, roles: ["ADMIN"] },
];

export function Sidebar({ role, name }: { role: Role; name: string }) {
  const pathname = usePathname();
  const items = NAV.filter((item) => item.roles.includes(role));
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
         
          <div>
            <h1 className="text-lg font-bold text-gray-900">WiseStyle</h1>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        flex flex-col h-screen w-64 bg-white border-r border-gray-200 shrink-0
        transform transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Section - Hidden on mobile, shown on desktop */}
        <div className="hidden lg:block p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            
            <div>
              <h1 className="text-xl font-bold text-gray-900">WiseStyle</h1>
              <p className="text-xs text-gray-500">Fashion Operations</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-16 lg:mt-0">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon size={20} className={active ? "text-white" : "text-gray-500"} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-900">{name}</p>
            <p className="text-xs text-gray-500">{role.charAt(0) + role.slice(1).toLowerCase()}</p>
          </div>
          <form action={logoutAction}>
            <button 
              type="submit" 
              className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

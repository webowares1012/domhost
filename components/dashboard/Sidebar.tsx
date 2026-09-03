"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

import {
  LayoutDashboard,
  Globe2,
  Server,
  Settings,
  Bell,
  ShieldCheck,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Domains",
    href: "/dashboard/domains",
    icon: Globe2,
  },
  {
    name: "Hosting",
    href: "/dashboard/hosting",
    icon: Server,
  },
  {
    name: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
  },
  {
    name: "Deleted Domains",
    href: "/dashboard/deleted",
    icon: ShieldCheck,
  },

];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({
  open,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  console.log(pathname)

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64
          border-r border-slate-200 bg-white
          transition-transform duration-300
          lg:translate-x-0
          ${open
            ? "translate-x-0"
            : "-translate-x-full"
          }
        `}
      >
        {/* Mobile Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div className="text-lg font-bold">
            <span className="text-slate-900">Dom</span>
            <span className="text-blue-600">Hub</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-1 p-4">
          {navigation.map((item) => {
            const Icon = item.icon;

            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${active
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
                  }`}
              >
                <Icon size={19} />

                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}




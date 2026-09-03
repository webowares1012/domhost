"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bell,
  LogOut,
  ChevronDown,
  Menu,
} from "lucide-react";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        const data = await response.json();

        if (data.success) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  // Close user dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return "U";

    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  async function handleLogout() {
    try {
      setLoggingOut(true);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        cache: "no-store",
      });

      const data = await response.json();

      if (data.success) {
        // Completely replace current history entry
        window.location.replace("/login");
      } else {
        console.error("Logout failed");
        setLoggingOut(false);
      }
    } catch (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      {/* ================================
          MOBILE LEFT SECTION
      ================================= */}
      <div className="flex items-center gap-3 md:hidden">
        {/* Burger Button */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open sidebar"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <Menu size={22} />
        </button>

        {/* Logo / Brand */}
        <div className="flex items-center">
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Dom
          </span>

          <span className="text-lg font-bold tracking-tight text-blue-600">
            Hub
          </span>
        </div>
      </div>

      {/* ================================
          DESKTOP LEFT SECTION
      ================================= */}
      <div className="hidden md:block">
        <p className="text-sm font-medium text-slate-600">
          Domain and hosting management
        </p>
      </div>

      {/* ================================
          RIGHT SECTION
      ================================= */}
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        {/* Notification */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <Bell size={20} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* User Dropdown */}
        <div
          ref={dropdownRef}
          className="relative border-l border-slate-200 pl-2 sm:pl-4"
        >
          <button
            type="button"
            onClick={() => setShowMenu((prev) => !prev)}
            className="flex items-center gap-2 rounded-xl px-1.5 py-1.5 transition hover:bg-slate-100 sm:gap-3 sm:px-2"
          >
            {/* Avatar */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold uppercase text-white">
              {loading ? "..." : getInitials(user?.name)}
            </div>

            {/* User Details */}
            <div className="hidden min-w-0 text-left sm:block">
              <p className="max-w-[180px] truncate text-sm font-semibold text-slate-900">
                {loading ? "Loading..." : user?.name || "User"}
              </p>

              <p className="text-xs font-medium capitalize text-slate-500">
                {loading ? "..." : user?.role || "User"}
              </p>
            </div>

            <ChevronDown
              size={16}
              className={`hidden text-slate-400 transition sm:block ${showMenu ? "rotate-180" : ""
                }`}
            />
          </button>

          {/* ================================
              USER DROPDOWN
          ================================= */}
          {showMenu && (
            <div className="absolute right-0 top-14 z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              {/* User Information */}
              <div className="border-b border-slate-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                    {getInitials(user?.name)}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {user?.name || "User"}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {user?.email || ""}
                    </p>

                    <span className="mt-1 inline-block text-xs font-medium capitalize text-slate-500">
                      {user?.role || "User"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu */}
              <div className="p-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <LogOut size={17} />

                  {loggingOut ? "Logging out..." : "Logout"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
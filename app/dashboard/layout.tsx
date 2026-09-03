"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import AuthGuard from "@/components/auth/AuthGuard";
import Header from "@/components/dashboard/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50">
        {/* Sidebar */}
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main */}
        <div className="lg:pl-64">
          <Header
            onMenuClick={() => setSidebarOpen(true)}
          />

          <main className="p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
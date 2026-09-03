"use client";

import { useEffect, useState } from "react";

import {
  Globe2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Server,
} from "lucide-react";

import StatCard from "@/components/dashboard/StatCard";

interface DashboardStats {
  totalDomains: number;
  activeDomains: number;
  expiredDomains: number;
  expiringDomains: number;
}

interface Domain {
  _id: string;
  domainName: string;
  category: string;
  purchasedFrom: string;
  purchaseDate?: string;
  expiryDate: string;
  status: string;
  renewalCost: number;
  currency: string;
  autoRenew: boolean;
  notes?: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const [upcomingDomains, setUpcomingDomains] = useState<Domain[]>([]);
  const [expiredDomains, setExpiredDomains] = useState<Domain[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch(
          "/api/dashboard/stats",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          console.error(
            "Dashboard API error:",
            data.message
          );

          return;
        }

        setStats(data.stats);

        setUpcomingDomains(
          data.upcomingDomains || []
        );

        setExpiredDomains(
          data.expiredDomainsList || []
        );
      } catch (error) {
        console.error(
          "Failed to fetch dashboard data:",
          error
        );
      }
    }

    fetchDashboardData();
  }, []);

  if (!stats) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage all your domains from one place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Domains"
          value={stats.totalDomains}
          description="All registered domains"
          icon={Globe2}
        />

        <StatCard
          title="Active"
          value={stats.activeDomains}
          description="Currently active"
          icon={CheckCircle2}
        />

        <StatCard
          title="Expiring Soon"
          value={stats.expiringDomains}
          description="Within 30 days"
          icon={AlertTriangle}
        />

        <StatCard
          title="Expired"
          value={stats.expiredDomains}
          description="Require attention"
          icon={XCircle}
        />

      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h2 className="font-semibold text-slate-900">Upcoming Renewals</h2>

            <p className="mt-1 text-xs text-slate-500">
              Domains expiring within the next 30 days
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 font-medium text-slate-500">Domain</th>

                <th className="px-5 py-3 font-medium text-slate-500">
                  Purchase From
                </th>

                <th className="px-5 py-3 font-medium text-slate-500">Expiry</th>

                <th className="px-5 py-3 font-medium text-slate-500">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {upcomingDomains.map((domain) => (
                <tr
                  key={domain._id}
                  className="hover:bg-slate-50"
                >
                  <td className="px-5 py-4 font-medium text-slate-900">
                    {domain.domainName}
                  </td>

                  <td className="px-5 py-4 text-slate-600 capitalize">
                    {domain.purchasedFrom || "—"}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {new Date(
                      domain.expiryDate
                    ).toLocaleDateString()}
                  </td>

                  <td className="px-5 py-4">
                    <a
                      href={`/dashboard/domains/${domain._id}`}
                      className="font-medium text-slate-900 hover:underline"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}

              {upcomingDomains.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No domains expiring within 30 days.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h2 className="font-semibold text-slate-900">
              Expired Domains
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              All expired domains that require attention.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 font-medium text-slate-500">
                  Domain
                </th>

                <th className="px-5 py-3 font-medium text-slate-500">
                  Purchased From
                </th>

                <th className="px-5 py-3 font-medium text-slate-500">
                  Expiry
                </th>

                <th className="px-5 py-3 font-medium text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {expiredDomains.map((domain) => (
                <tr
                  key={domain._id}
                  className="hover:bg-red-50/40"
                >
                  <td className="px-5 py-4 font-medium text-slate-900">
                    {domain.domainName}
                  </td>

                  <td className="px-5 py-4 text-slate-600 capitalize">
                    {domain.purchasedFrom || "—"}
                  </td>

                  <td className="px-5 py-4 text-red-600">
                    {new Date(
                      domain.expiryDate
                    ).toLocaleDateString()}
                  </td>

                  <td className="px-5 py-4">
                    <a
                      href={`/dashboard/domains/${domain._id}`}
                      className="font-medium text-slate-900 hover:underline"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}

              {expiredDomains.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No expired domains.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

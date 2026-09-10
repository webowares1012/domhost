"use client";

import { useState } from "react";
import {
    Plus,
    Search,
    Server,
    CalendarDays,
    Edit,
    Trash2,
    CheckCircle2,
    AlertCircle,
    XCircle,
} from "lucide-react";

const hostingData = [
    {
        id: 1,
        provider: "Hostinger",
        plan: "Business Web Hosting",
        domain: "example.com",
        expiry: "20 Dec 2026",
        cost: "₹3,999",
        status: "active",
        autoRenew: true,
    },
    {
        id: 2,
        provider: "GoDaddy",
        plan: "Deluxe Hosting",
        domain: "mywebsite.in",
        expiry: "15 Oct 2026",
        cost: "₹5,499",
        status: "expiring",
        autoRenew: false,
    },
    {
        id: 3,
        provider: "Namecheap",
        plan: "Stellar Plus",
        domain: "portfolio.com",
        expiry: "10 Aug 2026",
        cost: "₹2,899",
        status: "expired",
        autoRenew: false,
    },
];

export default function HostingPage() {
    const [search, setSearch] = useState("");

    const filteredHosting = hostingData.filter(
        (item) =>
            item.provider.toLowerCase().includes(search.toLowerCase()) ||
            item.plan.toLowerCase().includes(search.toLowerCase()) ||
            item.domain.toLowerCase().includes(search.toLowerCase())
    );

    const active = hostingData.filter((x) => x.status === "active").length;
    const expiring = hostingData.filter((x) => x.status === "expiring").length;
    const expired = hostingData.filter((x) => x.status === "expired").length;

    return (
        <main className="space-y-6 p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Hosting</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Manage your website hosting and renewal information.
                    </p>
                </div>

                <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                    <Plus size={18} />
                    Add Hosting
                </button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    icon={<Server size={20} />}
                    title="Total Hosting"
                    value={hostingData.length}
                />

                <StatCard
                    icon={<CheckCircle2 size={20} />}
                    title="Active"
                    value={active}
                />

                <StatCard
                    icon={<AlertCircle size={20} />}
                    title="Expiring Soon"
                    value={expiring}
                />

                <StatCard
                    icon={<XCircle size={20} />}
                    title="Expired"
                    value={expired}
                />
            </div>

            {/* Search */}
            <div className="relative">
                <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search provider, plan or domain..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
            </div>

            {/* Hosting Table */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-[900px] w-full text-left">
                        <thead className="bg-slate-50">
                            <tr className="text-xs uppercase tracking-wide text-slate-500">
                                <th className="px-5 py-4">Provider</th>
                                <th className="px-5 py-4">Plan</th>
                                <th className="px-5 py-4">Domain</th>
                                <th className="px-5 py-4">Expiry</th>
                                <th className="px-5 py-4">Renewal Cost</th>
                                <th className="px-5 py-4">Auto Renew</th>
                                <th className="px-5 py-4">Status</th>
                                <th className="px-5 py-4 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {filteredHosting.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50">
                                    <td className="px-5 py-4 font-semibold text-slate-900">
                                        {item.provider}
                                    </td>

                                    <td className="px-5 py-4 text-sm text-slate-600">
                                        {item.plan}
                                    </td>

                                    <td className="px-5 py-4 font-medium text-slate-700">
                                        {item.domain}
                                    </td>

                                    <td className="px-5 py-4 text-sm text-slate-600">
                                        <span className="inline-flex items-center gap-2">
                                            <CalendarDays size={15} />
                                            {item.expiry}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4 font-medium text-slate-700">
                                        {item.cost}
                                    </td>

                                    <td className="px-5 py-4">
                                        <span
                                            className={`text-xs font-semibold ${item.autoRenew
                                                    ? "text-emerald-600"
                                                    : "text-slate-400"
                                                }`}
                                        >
                                            {item.autoRenew ? "Enabled" : "Disabled"}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4">
                                        <StatusBadge status={item.status} />
                                    </td>

                                    <td className="px-5 py-4">
                                        <div className="flex justify-end gap-2">
                                            <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                                                <Edit size={17} />
                                            </button>

                                            <button className="rounded-lg p-2 text-red-500 hover:bg-red-50">
                                                <Trash2 size={17} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredHosting.length === 0 && (
                    <div className="p-12 text-center text-sm text-slate-500">
                        No hosting records found.
                    </div>
                )}
            </section>
        </main>
    );
}

function StatCard({
    icon,
    title,
    value,
}: {
    icon: React.ReactNode;
    title: string;
    value: number;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 text-slate-500">{icon}</div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        active: "bg-emerald-50 text-emerald-700",
        expiring: "bg-amber-50 text-amber-700",
        expired: "bg-red-50 text-red-700",
    };

    const labels = {
        active: "Active",
        expiring: "Expiring Soon",
        expired: "Expired",
    };

    return (
        <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status as keyof typeof styles]
                }`}
        >
            {labels[status as keyof typeof labels]}
        </span>
    );
}
"use client";

import { useState } from "react";
import {
    Trash2,
    RotateCcw,
    Search,
    CalendarDays,
    TriangleAlert,
    X,
} from "lucide-react";

interface DeletedDomain {
    id: number;
    domainName: string;
    category: string;
    purchasedFrom: string;
    expiryDate: string;
    deletedAt: string;
    renewalCost: string;
}

const initialDomains: DeletedDomain[] = [
    {
        id: 1,
        domainName: "oldwebsite.com",
        category: "Business",
        purchasedFrom: "GoDaddy",
        expiryDate: "20 Dec 2026",
        deletedAt: "10 Sep 2026",
        renewalCost: "₹1,299",
    },
    {
        id: 2,
        domainName: "testproject.in",
        category: "Project",
        purchasedFrom: "Namecheap",
        expiryDate: "15 Nov 2026",
        deletedAt: "05 Sep 2026",
        renewalCost: "₹899",
    },
    {
        id: 3,
        domainName: "unusedsite.net",
        category: "Personal",
        purchasedFrom: "Hostinger",
        expiryDate: "01 Jan 2027",
        deletedAt: "28 Aug 2026",
        renewalCost: "₹1,499",
    },
];

export default function DeletedDomainsPage() {
    const [domains, setDomains] = useState(initialDomains);
    const [search, setSearch] = useState("");

    const filteredDomains = domains.filter((domain) =>
        `${domain.domainName} ${domain.category} ${domain.purchasedFrom}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    function restoreDomain(id: number) {
        const confirmed = window.confirm(
            "Are you sure you want to restore this domain?"
        );

        if (!confirmed) return;

        setDomains((prev) => prev.filter((domain) => domain.id !== id));

        alert("Domain restored successfully.");
    }

    function permanentlyDelete(id: number) {
        const confirmed = window.confirm(
            "This will permanently delete the domain. This action cannot be undone. Continue?"
        );

        if (!confirmed) return;

        setDomains((prev) => prev.filter((domain) => domain.id !== id));

        alert("Domain permanently deleted.");
    }

    return (
        <main className="space-y-6 p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">
                    Deleted Domains
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Manage domains that have been moved to the recycle bin.
                </p>
            </div>

            {/* Warning */}
            <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <TriangleAlert
                    size={21}
                    className="mt-0.5 shrink-0 text-amber-600"
                />

                <div>
                    <h3 className="text-sm font-semibold text-amber-900">
                        Recycle Bin
                    </h3>

                    <p className="mt-1 text-sm text-amber-700">
                        Domains here are hidden from your main domain list. You
                        can restore them or permanently delete them.
                    </p>
                </div>
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
                    placeholder="Search deleted domains..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
            </div>

            {/* Deleted Domains */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {filteredDomains.length === 0 ? (
                    <div className="p-12 text-center">
                        <Trash2
                            size={44}
                            className="mx-auto text-slate-300"
                        />

                        <h3 className="mt-4 font-semibold text-slate-900">
                            Recycle bin is empty
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            No deleted domains found.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredDomains.map((domain) => (
                            <article
                                key={domain.id}
                                className="p-5 transition hover:bg-slate-50"
                            >
                                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                                    {/* Domain Info */}
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="text-base font-semibold text-slate-900">
                                                {domain.domainName}
                                            </h2>

                                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                                {domain.category}
                                            </span>
                                        </div>

                                        <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2 lg:grid-cols-4">
                                            <div>
                                                <span className="font-medium text-slate-700">
                                                    Purchased From:
                                                </span>{" "}
                                                {domain.purchasedFrom}
                                            </div>

                                            <div>
                                                <span className="font-medium text-slate-700">
                                                    Expiry:
                                                </span>{" "}
                                                {domain.expiryDate}
                                            </div>

                                            <div>
                                                <span className="font-medium text-slate-700">
                                                    Renewal:
                                                </span>{" "}
                                                {domain.renewalCost}
                                            </div>

                                            <div className="inline-flex items-center gap-1">
                                                <CalendarDays size={13} />

                                                <span>
                                                    Deleted: {domain.deletedAt}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                                        <button
                                            onClick={() => restoreDomain(domain.id)}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                                        >
                                            <RotateCcw size={16} />
                                            Restore
                                        </button>

                                        <button
                                            onClick={() => permanentlyDelete(domain.id)}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 size={16} />
                                            Permanently Delete
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
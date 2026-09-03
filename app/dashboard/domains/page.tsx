"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";

import DomainStatusBadge from "@/components/domains/DomainStatusBadge";

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
  notes: string;
}

export default function DomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [purchasedFrom, setPurchasedFrom] = useState("all");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  async function fetchDomains() {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set(
          "search",
          search.trim(),
        );
      }

      if (status !== "all") {
        params.set("status", status);
      }

      if (category !== "all") {
        params.set(
          "category",
          category,
        );
      }

      if (
        purchasedFrom !== "all"
      ) {
        params.set(
          "purchasedFrom",
          purchasedFrom,
        );
      }

      const response = await fetch(
        `/api/domains?${params.toString()}`,
        {
          credentials: "include",
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        console.error(
          data.message ||
          "Failed to fetch domains",
        );

        return;
      }

      if (data.success) {
        setDomains(
          data.domains || [],
        );
      }
    } catch (error) {
      console.error(
        "Fetch domains error:",
        error,
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * Initial load
   */
  useEffect(() => {
    fetchDomains();
  }, []);

  /*
   * Search and filters
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDomains();
    }, 300);

    return () =>
      clearTimeout(timer);
  }, [
    search,
    status,
    category,
    purchasedFrom,
  ]);

  /*
   * Toggle expanded row
   */
  function toggleExpanded(
    domainId: string,
  ) {
    setExpandedDomain(
      (current) =>
        current === domainId
          ? null
          : domainId,
    );

    setOpenMenu(null);
  }

  /*
   * Delete domain
   */
  async function deleteDomain(
    domainId: string,
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this domain? This action cannot be undone.",
      );

    if (!confirmed) {
      return;
    }

    try {
      const response =
        await fetch(
          `/api/domains/${domainId}`,
          {
            method: "DELETE",
            credentials: "include",
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
          "Failed to delete domain",
        );

        return;
      }

      if (data.success) {
        setDomains(
          (current) =>
            current.filter(
              (domain) =>
                domain._id !==
                domainId,
            ),
        );

        setOpenMenu(null);

        setExpandedDomain(null);

        alert(
          "Domain deleted successfully",
        );
      }
    } catch (error) {
      console.error(
        "Delete domain error:",
        error,
      );

      alert(
        "Something went wrong while deleting the domain.",
      );
    }
  }

  /*
   * Close menu when clicking outside
   */
  useEffect(() => {
    function handleClickOutside() {
      setOpenMenu(null);
    }

    if (openMenu) {
      document.addEventListener(
        "click",
        handleClickOutside,
      );
    }

    return () => {
      document.removeEventListener(
        "click",
        handleClickOutside,
      );
    };
  }, [openMenu]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Domains
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your complete domain
            portfolio.
          </p>
        </div>

        <Link
          href="/dashboard/domains/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus size={18} />

          Add Domain
        </Link>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value,
                )
              }
              placeholder="Search domain..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
            />
          </div>

          {/* Status */}
          <select
            value={status}
            onChange={(e) =>
              setStatus(
                e.target.value,
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
          >
            <option value="all">
              All Status
            </option>

            <option value="active">
              Active
            </option>

            <option value="expiring">
              Expiring
            </option>

            <option value="expired">
              Expired
            </option>

            <option value="inactive">
              Inactive
            </option>
          </select>

          {/* Category */}
          <select
            value={category}
            onChange={(e) =>
              setCategory(
                e.target.value,
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
          >
            <option value="all">
              All Categories
            </option>

            <option value="business">
              Business
            </option>

            <option value="personal">
              Personal
            </option>

            <option value="client">
              Client
            </option>

            <option value="project">
              Project
            </option>

            <option value="ecommerce">
              Ecommerce
            </option>

            <option value="portfolio">
              Portfolio
            </option>

            <option value="other">
              Other
            </option>
          </select>

          {/* Purchased From */}
          <select
            value={purchasedFrom}
            onChange={(e) =>
              setPurchasedFrom(
                e.target.value,
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
          >
            <option value="all">
              All Providers
            </option>

            <option value="namecheap">
              Namecheap
            </option>

            <option value="hostinger">
              Hostinger
            </option>

            <option value="godaddy">
              GoDaddy
            </option>
          </select>

          {/* Clear Filters */}
          {(search ||
            status !== "all" ||
            category !== "all" ||
            purchasedFrom !==
            "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatus("all");
                  setCategory("all");
                  setPurchasedFrom(
                    "all",
                  );
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                <X size={16} />

                Clear
              </button>
            )}
        </div>
      </div>

      {/* Result count */}
      <div className="text-sm text-slate-500">
        Showing{" "}
        <span className="font-semibold text-slate-700">
          {domains.length}
        </span>{" "}
        domain
        {domains.length !== 1
          ? "s"
          : ""}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-4 font-semibold text-slate-600">
                  S.No
                </th>

                <th className="px-5 py-4 font-semibold text-slate-600">
                  Domain
                </th>

                <th className="px-5 py-4 font-semibold text-slate-600">
                  Category
                </th>

                <th className="px-5 py-4 font-semibold text-slate-600">
                  Purchased From
                </th>

                <th className="px-5 py-4 font-semibold text-slate-600">
                  Purchased Date
                </th>

                <th className="px-5 py-4 font-semibold text-slate-600">
                  Expiry
                </th>

                <th className="px-5 py-4 font-semibold text-slate-600">
                  Status
                </th>

                <th className="w-16 px-5 py-4" />
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {domains.map(
                (
                  domain,
                  index,
                ) => {
                  const isExpanded =
                    expandedDomain ===
                    domain._id;

                  const isMenuOpen =
                    openMenu ===
                    domain._id;

                  return (
                    <DomainRow
                      key={
                        domain._id
                      }
                      domain={
                        domain
                      }
                      index={
                        index
                      }
                      isExpanded={
                        isExpanded
                      }
                      isMenuOpen={
                        isMenuOpen
                      }
                      onToggleExpanded={() =>
                        toggleExpanded(
                          domain._id,
                        )
                      }
                      onMenuToggle={(
                        e,
                      ) => {
                        e.stopPropagation();

                        setOpenMenu(
                          isMenuOpen
                            ? null
                            : domain._id,
                        );
                      }}
                      onDelete={() =>
                        deleteDomain(
                          domain._id,
                        )
                      }
                    />
                  );
                },
              )}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {!loading &&
          domains.length ===
          0 && (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <Search
                  size={20}
                  className="text-slate-400"
                />
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-900">
                No domains found
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your search
                or filters.
              </p>
            </div>
          )}

        {/* Loading */}
        {loading && (
          <div className="p-6 text-center text-sm text-slate-500">
            Loading domains...
          </div>
        )}
      </div>


    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Domain Row
|--------------------------------------------------------------------------
*/

function DomainRow({
  domain,
  index,
  isExpanded,
  isMenuOpen,
  onToggleExpanded,
  onMenuToggle,
  onDelete,
}: {
  domain: Domain;
  index: number;
  isExpanded: boolean;
  isMenuOpen: boolean;
  onToggleExpanded: () => void;
  onMenuToggle: (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => void;
  onDelete: () => void;
}) {

  const domainStatus = calculateDomainStatus(
    domain.expiryDate,
    domain.status
  );

  return (
    <>
      {/* Main row */}
      <tr
        className={`transition ${isExpanded
          ? "bg-slate-50"
          : "hover:bg-slate-50"
          }`}
      >
        {/* S.No */}
        <td className="px-5 py-4">
          <span className="font-medium text-slate-500">
            {index + 1}
          </span>
        </td>

        {/* Domain */}
        <td className="px-5 py-4">
          <p className="font-semibold text-slate-900">
            {domain.domainName}
          </p>
        </td>

        {/* Category */}
        <td className="px-5 py-4">
          <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-700">
            {domain.category}
          </span>
        </td>

        {/* Purchased From */}
        <td className="px-5 py-4 text-slate-600">
          <span className="capitalize">
            {domain.purchasedFrom ||
              "—"}
          </span>
        </td>

        {/* Purchase Date */}
        <td className="px-5 py-4 text-slate-600">
          {domain.purchaseDate
            ? new Date(
              domain.purchaseDate,
            ).toLocaleDateString()
            : "—"}
        </td>

        {/* Expiry */}
        <td className="px-5 py-4 text-slate-600">
          {domain.expiryDate
            ? new Date(
              domain.expiryDate,
            ).toLocaleDateString()
            : "—"}
        </td>


        {/* Status */}
        <td className="px-5 py-4">
          <div>
            <DomainStatusBadge status={domainStatus.status} message={domainStatus.message} />


          </div>
        </td>

        <td className="px-5 py-4 text-right">
          {/* Show More */}
          <button
            type="button"
            onClick={
              onToggleExpanded
            }
            className="flex w-full items-center gap-3  py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
          >
            {isExpanded ? (
              <ChevronUp
                size={16}
              />
            ) : (
              <ChevronDown
                size={16}
              />
            )}


          </button>

        </td>

        {/* Three dot menu */}
        <td className="relative  py-4 text-right">
          <button
            type="button"
            onClick={onMenuToggle}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
            aria-label="Domain actions"
          >
            <MoreVertical
              size={20}
            />
          </button>

          {isMenuOpen && (
            <div
              onClick={(e) =>
                e.stopPropagation()
              }
              className="absolute right-5 top-14 z-50 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-left shadow-lg"
            >
              {/* Edit */}
              <Link
                href={`/dashboard/domains/${domain._id}`}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                <Pencil
                  size={16}
                />

                Edit
              </Link>


              <div className="my-1 border-t border-slate-100" />

              {/* Delete */}
              <button
                type="button"
                onClick={onDelete}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
              >
                <Trash2
                  size={16}
                />

                Delete
              </button>
            </div>
          )}
        </td>
      </tr>

      {/* Expanded details */}
      {isExpanded && (
        <tr className="bg-slate-50">
          <td
            colSpan={9}
            className="px-5 pb-5"
          >
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="grid gap-5 md:grid-cols-3">
                {/* Renewal Cost */}
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Renewal Cost
                  </p>

                  <p className="mt-1 text-base font-semibold text-slate-900">
                    {domain.currency}{" "}
                    {Number(
                      domain.renewalCost ||
                      0,
                    ).toLocaleString()}
                  </p>
                </div>

                {/* Currency */}
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Currency
                  </p>

                  <p className="mt-1 text-base font-semibold uppercase text-slate-900">
                    {domain.currency ||
                      "—"}
                  </p>
                </div>

                {/* Auto Renew */}
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Auto Renewal
                  </p>

                  {/* Auto Renew */}
                  <p className="mt-1 text-base font-semibold text-slate-900">
                    {domain.autoRenew ? (
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                        Enabled
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-500">
                        Disabled
                      </span>
                    )}
                  </p>
                </div>

                {/* Notes */}
                <div className="md:col-span-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Notes
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {domain.notes?.trim()
                      ? domain.notes
                      : "No notes available."}
                  </p>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}


type DomainStatus = "active" | "expiring" | "expired" | "inactive";

interface DomainStatusResult {
  status: DomainStatus;
  daysRemaining: number;
  message: string;
}

function calculateDomainStatus(
  expiryDate: string | Date,
  currentStatus?: string
): DomainStatusResult {
  // Explicitly inactive
  if (currentStatus === "inactive") {
    return {
      status: "inactive",
      daysRemaining: 0,
      message: "Domain is inactive",
    };
  }

  const today = new Date();
  const expiry = new Date(expiryDate);

  // Ignore time of day
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  const difference = expiry.getTime() - today.getTime();

  const daysRemaining = Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );

  // Expired
  if (daysRemaining < 0) {
    const daysAgo = Math.abs(daysRemaining);

    return {
      status: "expired",
      daysRemaining,
      message:
        daysAgo === 1
          ? " 1 day ago"
          : ` ${daysAgo} days ago`,
    };
  }

  // Expires today
  if (daysRemaining === 0) {
    return {
      status: "expiring",
      daysRemaining: 0,
      message: " today",
    };
  }

  // Expires within 30 days
  if (daysRemaining <= 30) {
    return {
      status: "expiring",
      daysRemaining,
      message:
        daysRemaining === 1
          ? " in 1 day"
          : ` in ${daysRemaining} days`,
    };
  }

  // More than 30 days remaining
  return {
    status: "active",
    daysRemaining,
    message:
      daysRemaining === 1
        ? " 1 day remaining"
        : ` ${daysRemaining} days remaining`,
  };
}
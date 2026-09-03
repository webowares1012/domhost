"use client";

import { SyntheticEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";

interface DomainFormProps {
  initialData?: {
    _id?: string;
    domainName?: string;
    category?: string;
    purchasedFrom?: string;
    purchaseDate?: string;
    expiryDate?: string;
    status?: string;
    renewalCost?: number;
    currency?: string;
    autoRenew?: boolean;
    notes?: string;
  };
  domainId?: string;
}

interface DomainFormData {
  domainName: string;
  category: string;
  purchasedFrom: string;
  purchaseDate: string;
  expiryDate: string;
  status: string;
  renewalCost: string;
  currency: string;
  autoRenew: boolean;
  notes: string;
}

export default function DomainForm({ initialData, domainId }: DomainFormProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<DomainFormData>({
    domainName: initialData?.domainName || "",
    category: initialData?.category || "",
    purchasedFrom: initialData?.purchasedFrom || "",
    purchaseDate: initialData?.purchaseDate
      ? new Date(initialData.purchaseDate).toISOString().split("T")[0]
      : "",
    expiryDate: initialData?.expiryDate
      ? new Date(initialData.expiryDate).toISOString().split("T")[0]
      : "",
    status: initialData?.status || "active",
    renewalCost:
      initialData?.renewalCost !== undefined
        ? String(initialData.renewalCost)
        : "",
    currency: initialData?.currency || "INR",
    autoRenew: initialData?.autoRenew || false,
    notes: initialData?.notes || "",
  });

  function updateField<K extends keyof DomainFormData>(
    field: K,
    value: DomainFormData[K],
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function submit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.domainName.trim()) {
      alert("Please enter domain name");
      return;
    }

    if (!form.category) {
      alert("Please select a category");
      return;
    }

    if (!form.purchasedFrom) {
      alert("Please select where the domain was purchased");
      return;
    }

    if (!form.expiryDate) {
      alert("Please select expiry date");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        domainName: form.domainName.toLowerCase().trim(),
        category: form.category,
        purchasedFrom: form.purchasedFrom,
        purchaseDate: form.purchaseDate || undefined,
        expiryDate: form.expiryDate,
        status: form.status,
        renewalCost: form.renewalCost ? Number(form.renewalCost) : 0,
        currency: form.currency,
        autoRenew: form.autoRenew,
        notes: form.notes.trim(),
      };

      console.log("Sending domain payload:", payload);

      const response = await fetch(
        domainId ? `/api/domains/${domainId}` : "/api/domains",
        {
          method: domainId ? "PUT" : "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      console.log("Server response:", data);

      if (!response.ok) {
        alert(data.message || "Failed to save domain");
        return;
      }

      if (!data.success) {
        alert(data.message || "Failed to save domain");
        return;
      }

      alert(
        domainId ? "Domain updated successfully" : "Domain saved successfully",
      );

      router.push("/dashboard/domains");

      router.refresh();
    } catch (error) {
      console.error("Save domain error:", error);

      alert("Something went wrong while saving the domain");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Domain Information */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Domain Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Add the basic information about your domain.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Domain Name */}
          <Field
            label="Domain Name"
            value={form.domainName}
            onChange={(value) => updateField("domainName", value)}
            placeholder="example.com"
            required
          />

          {/* Category */}
          <SelectField
            label="Category"
            value={form.category}
            onChange={(value) => updateField("category", value)}
            required
          >
            <option value="">Select category</option>

            <option value="business">Business</option>

            <option value="personal">Personal</option>

            <option value="client">Client</option>

            <option value="project">Project</option>

            <option value="ecommerce">E-Commerce</option>

            <option value="portfolio">Portfolio</option>

            <option value="other">Other</option>
          </SelectField>

          {/* Purchased From */}
          <SelectField
            label="Purchased From"
            value={form.purchasedFrom}
            onChange={(value) => updateField("purchasedFrom", value)}
            required
          >
            <option value="">Select provider</option>

            <option value="namecheap">Namecheap</option>

            <option value="hostinger">Hostinger</option>

            <option value="godaddy">GoDaddy</option>
          </SelectField>

          {/* Status */}
          {/* <SelectField
            label="Status"
            value={form.status}
            onChange={(value) => updateField("status", value)}
          >
            <option value="active">Active</option>

            <option value="expiring">Expiring</option>

            <option value="expired">Expired</option>

            <option value="locked">Locked</option>

            <option value="transferred">Transferred</option>

            <option value="inactive">Inactive</option>
          </SelectField> */}

          {/* Purchase Date */}
          <Field
            label="Purchase Date"
            type="date"
            value={form.purchaseDate}
            onChange={(value) => updateField("purchaseDate", value)}
          />

          {/* Expiry Date */}
          <Field
            label="Expiry Date"
            type="date"
            value={form.expiryDate}
            onChange={(value) => updateField("expiryDate", value)}
            required
          />

          {/* Renewal Cost */}
          <Field
            label="Renewal Cost"
            type="number"
            value={form.renewalCost}
            onChange={(value) => updateField("renewalCost", value)}
            placeholder="0.00"
          />

          {/* Currency */}
          <SelectField
            label="Currency"
            value={form.currency}
            onChange={(value) => updateField("currency", value)}
          >
            <option value="INR">INR - Indian Rupee</option>

            <option value="USD">USD - US Dollar</option>

            <option value="EUR">EUR - Euro</option>

            <option value="GBP">GBP - British Pound</option>
          </SelectField>
        </div>

        {/* Auto Renewal */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <label className="flex cursor-pointer items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Auto Renewal
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Enable if this domain is configured for automatic renewal.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={form.autoRenew}
              onClick={() => updateField("autoRenew", !form.autoRenew)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition ${form.autoRenew ? "bg-slate-900" : "bg-slate-300"
                }`}
            >
              <span
                className={`inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition ${form.autoRenew ? "translate-x-5" : "translate-x-0.5"
                  }`}
              />
            </button>
          </label>
        </div>
      </section>

      {/* Notes */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Notes</h2>

        <p className="mt-1 text-sm text-slate-500">
          Add any additional information about this domain.
        </p>

        <div className="mt-5">
          <textarea
            rows={6}
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            placeholder="Add notes about this domain..."
            className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          disabled={loading}
          onClick={() => router.push("/dashboard/domains")}
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              {domainId ? "Updating..." : "Saving..."}
            </>
          ) : (
            <>
              <Save size={17} />

              {domainId ? "Update Domain" : "Save Domain"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

/* -------------------------------- */
/* Input Field                      */
/* -------------------------------- */

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
      />
    </div>
  );
}

/* -------------------------------- */
/* Select Field                     */
/* -------------------------------- */

function SelectField({
  label,
  value,
  onChange,
  children,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <select
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
      >
        {children}
      </select>
    </div>
  );
}

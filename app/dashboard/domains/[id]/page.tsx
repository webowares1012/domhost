"use client";

import { useEffect, useState } from "react";
import DomainForm from "@/components/domains/DomainForm";

export default function DomainDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [domain, setDomain] = useState<any>(null);

  useEffect(() => {
    params.then(({ id }) => {
      fetch(`/api/domains/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setDomain(data.domain);
          }
        });
    });
  }, [params]);

  if (!domain) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Manage Domain
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          {domain.domainName}
        </p>
      </div>

      <DomainForm
        initialData={domain}
        domainId={domain._id}
      />
    </div>
  );
}
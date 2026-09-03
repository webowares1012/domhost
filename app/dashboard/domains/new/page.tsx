import DomainForm from "@/components/domains/DomainForm";

export default function NewDomainPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add Domain</h1>

        <p className="mt-1 text-sm text-slate-500">
          Add a domain to your centralized portfolio.
        </p>
      </div>

      <DomainForm />
    </div>
  );
}

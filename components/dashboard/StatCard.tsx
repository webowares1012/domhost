import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: LucideIcon;
}

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>

          <p className="mt-2 text-xs text-slate-500">{description}</p>
        </div>

        <div className="rounded-xl bg-slate-100 p-3">
          <Icon size={21} className="text-slate-700" />
        </div>
      </div>
    </div>
  );
}

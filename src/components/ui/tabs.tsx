import Link from "next/link";

import { cn } from "@/lib/utils";

export function SegmentTabs({
  items,
  active,
}: {
  items: Array<{ label: string; href: string; key: string }>;
  active: string;
}) {
  return (
    <div className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-1">
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={cn(
            "rounded-[14px] px-4 py-2 text-sm font-medium text-slate-300",
            active === item.key && "bg-orange-500 text-white shadow-lg shadow-orange-500/20",
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

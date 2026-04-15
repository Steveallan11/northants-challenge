import { cn } from "@/lib/utils";
import type { BackendStatus } from "@/lib/data";

export function BackendStatusBanner({
  status,
  variant = "public",
  className,
}: {
  status: BackendStatus;
  variant?: "public" | "admin";
  className?: string;
}) {
  const isLive = status.mode === "live";

  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3 text-sm",
        isLive ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100" : "border-amber-500/30 bg-amber-500/10 text-amber-100",
        className,
      )}
    >
      <p className="font-semibold">{isLive ? "Live backend connected" : "Preview fallback mode"}</p>
      <p className="mt-1 text-sm/6">
        {isLive
          ? variant === "admin"
            ? "Cloud SQL is reachable, so dashboard stats, attempts, responses, and leaderboard data are live."
            : "This quiz is saving real attempts and scores to the backend."
          : variant === "admin"
            ? "Cloud SQL is not reachable right now, so this dashboard is showing fallback preview data rather than live quiz activity."
            : "This preview still works, but quiz runs are using local fallback mode until the live database connection is available."}
      </p>
    </div>
  );
}

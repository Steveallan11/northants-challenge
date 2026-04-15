import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 py-8">
      <div className="page-shell flex flex-col gap-4 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-medium text-slate-200">Northants Challenge</p>
          <p>Built for Northamptonshire communities, sponsors, and local business campaigns.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-white">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-white">
            Terms
          </Link>
          <Link href="/admin/login" className="hover:text-white">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}

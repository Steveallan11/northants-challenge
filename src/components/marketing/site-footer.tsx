import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="brand-footer-strip py-8">
      <div className="page-shell flex flex-col gap-4 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="headline-brand text-base text-slate-100">Northants Challenge</p>
          <p>Bold local questions, useful community moments, and sponsor-ready campaign energy for Northamptonshire.</p>
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

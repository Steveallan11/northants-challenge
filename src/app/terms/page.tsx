export default function TermsPage() {
  return (
    <main className="page-shell max-w-3xl py-12">
      <div className="glass-panel rounded-[28px] border border-white/10 p-8">
        <h1 className="text-4xl font-semibold text-white">Terms and competition rules</h1>
        <div className="mt-6 space-y-4 text-slate-300">
          <p>Each player gets one scored attempt per email address for each weekly quiz. Duplicate scored attempts are blocked automatically.</p>
          <p>Leaderboard ranking uses total score first, then lower average response time, then the earliest completed timestamp as the final tie-break.</p>
          <p>Admins may remove fraudulent, spam, or abusive entries to keep the competition fair.</p>
          <p>This page is a polished placeholder and should be replaced with your final terms before public launch.</p>
        </div>
      </div>
    </main>
  );
}

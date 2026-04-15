export default function PrivacyPage() {
  return (
    <main className="page-shell max-w-3xl py-12">
      <div className="glass-panel rounded-[28px] border border-white/10 p-8">
        <h1 className="text-4xl font-semibold text-white">Privacy</h1>
        <div className="mt-6 space-y-4 text-slate-300">
          <p>We collect the details needed to run the weekly challenge, calculate scores, publish safe leaderboard data, and manage newsletter preferences.</p>
          <p>Email addresses are never shown on the public leaderboard. Only first names and optional towns are displayed publicly.</p>
          <p>Admin access is restricted to approved accounts using Supabase Auth. Data exports are available only inside the admin area.</p>
          <p>This page is ready for your final legal copy before launch.</p>
        </div>
      </div>
    </main>
  );
}

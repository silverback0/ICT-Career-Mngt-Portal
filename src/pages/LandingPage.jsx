import React from 'react';

export default function LandingPage({ onNavigateToAuth }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* --- NAVBAR --- */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-950">
              P
            </div>
            <span className="font-bold text-lg text-white tracking-wide">PipelineHQ</span>
          </div>
          <button
            onClick={onNavigateToAuth}
            className="text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-lg transition-colors"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="max-w-4xl mx-auto text-center px-6 pt-24 pb-16">
        <div className="inline-block bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full mb-6">
          Streamlined Intern & Talent Management
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
          The all-in-one platform for <span className="text-emerald-400">admin pipelines</span> and intern success.
        </h1>
        <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-8">
          Bridge the gap between talent and management. Track applications, streamline candidate workflows, and empower interns with dedicated dashboards.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={onNavigateToAuth}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-emerald-500/10 transition-all text-base"
          >
            Get Started Now
          </button>
          <a
            href="#features"
            className="bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold px-8 py-3.5 rounded-xl border border-slate-800 transition-all text-base"
          >
            Explore Features
          </a>
        </div>
      </section>

      {/* --- VALUE PROPOSITION / FEATURES --- */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-16 border-t border-slate-800/60">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Built for Both Sides of the Pipeline</h2>
          <p className="text-slate-400">Custom tailored experiences whether you are running the program or joining it.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Admin Card */}
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl hover:border-emerald-500/40 transition-colors">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center text-xl font-bold mb-4">
              🛡️
            </div>
            <h3 className="text-xl font-bold text-white mb-2">For Admins & Managers</h3>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span> Full oversight of hiring and candidate pipelines.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span> Centralized job context and placement metrics.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span> Role-based management to secure administrative tools.
              </li>
            </ul>
          </div>

          {/* Intern Card */}
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl hover:border-emerald-500/40 transition-colors">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center text-xl font-bold mb-4">
              🎓
            </div>
            <h3 className="text-xl font-bold text-white mb-2">For Interns & Talent</h3>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span> Personalized dashboard tracking application status.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span> Clear visibility into requirements, tasks, and program updates.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span> Hassle-free communication and progress monitoring.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <section className="max-w-4xl mx-auto text-center px-6 py-16 border-t border-slate-800/60">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to access your dashboard?</h2>
        <p className="text-slate-400 mb-6">Log in to view your administrative tools or check your talent profile.</p>
        <button
          onClick={onNavigateToAuth}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-3.5 rounded-xl shadow-lg transition-all"
        >
          Access Portal
        </button>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-slate-900 py-8 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} Pipeline Platform. All rights reserved.
      </footer>
    </div>
  );
}
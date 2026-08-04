import React from 'react';

export default function LandingPage({ onNavigateToAuth }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* --- BACKGROUND GRAPHICS --- */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* --- NAVBAR --- */}
        <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            {/* DevTrack Logo */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-black text-slate-950 text-lg shadow-md shadow-emerald-500/20">
                DT
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                Dev<span className="text-emerald-400">Track</span>
              </span>
            </div>

            {/* Sign In Button */}
            <button
              onClick={onNavigateToAuth}
              className="text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2 rounded-lg transition-all shadow-md shadow-emerald-500/10 hover:scale-[1.02]"
            >
              Sign In
            </button>
          </div>
        </nav>

        {/* --- SECTION 1: HERO (ABOVE THE FOLD) --- */}
        <section className="max-w-5xl mx-auto text-center px-6 pt-20 pb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Kenya's National ICT Talent Pipeline
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight mb-6">
            Your Gateway to <br className="hidden sm:inline" />
            <span className="bg-linear-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Government ICT Placement
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Track your internship journey from registration to county deployment across Ministries, Departments, and Agencies (MDAs).
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
            <button
              onClick={onNavigateToAuth}
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all text-base hover:scale-[1.02]"
            >
              Apply Now
            </button>
            <a
              href="#what-it-is"
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold px-8 py-4 rounded-xl border border-slate-800 transition-all text-base text-center"
            >
              Learn More
            </a>
          </div>

          {/* Visual Showcase Box / Mock Dashboard Banner */}
          <div className="relative mx-auto max-w-4xl rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-2xl backdrop-blur">
            <div className="flex items-center gap-2 mb-3 px-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
              <span className="text-xs text-slate-500 font-mono ml-2">devtrack.icta.go.ke/dashboard</span>
            </div>
            <div className="h-64 sm:h-80 rounded-lg bg-slate-950/80 border border-slate-800/80 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-3xl mb-4 border border-emerald-500/20">
                🗺️
              </div>
              <h3 className="text-lg font-bold text-white mb-1">County Placement & Candidate Pipeline</h3>
              <p className="text-slate-400 text-sm max-w-md">
                Real-time tracking system connecting talent cohorts with 47 county government deployments.
              </p>
            </div>
          </div>
        </section>

        {/* --- SECTION 2: WHAT IT IS (3 CARDS) --- */}
        <section id="what-it-is" className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-800/60">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-3">How DevTrack Works</h2>
            <p className="text-slate-400">A structured path from application to national digital impact.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl relative group hover:border-emerald-500/40 transition-colors">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center text-xl font-extrabold mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Register</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Create your verified profile, upload credentials, and join an active national ICT talent cohort.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl relative group hover:border-emerald-500/40 transition-colors">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center text-xl font-extrabold mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Get Matched</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Our pipeline matches your technical skill sets directly with active government MDA opportunities.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl relative group hover:border-emerald-500/40 transition-colors">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center text-xl font-extrabold mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Get Placed</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Receive official deployment to county-level positions and track your field progress in real-time.
              </p>
            </div>
          </div>
        </section>

        {/* --- SECTION 3: STATS (CREDIBILITY) --- */}
        <section className="bg-slate-900/30 border-y border-slate-800/80 py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              <div className="p-4">
                <div className="text-4xl sm:text-5xl font-black text-emerald-400 mb-2">352</div>
                <div className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Interns Tracked</div>
              </div>
              <div className="p-4 border-t sm:border-t-0 sm:border-x border-slate-800">
                <div className="text-4xl sm:text-5xl font-black text-emerald-400 mb-2">47</div>
                <div className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Counties Covered</div>
              </div>
              <div className="p-4 border-t sm:border-t-0 border-slate-800">
                <div className="text-4xl sm:text-5xl font-black text-emerald-400 mb-2">Active</div>
                <div className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Multiple Cohorts</div>
              </div>
            </div>
          </div>
        </section>

        {/* --- SECTION 4: WHO IT'S FOR --- */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-3">Designed for the Entire Ecosystem</h2>
            <p className="text-slate-400">Tailored portals for both talent and program administrators.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* For Interns Column */}
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">🎓</span>
                <h3 className="text-xl font-bold text-white">For Interns</h3>
              </div>
              <ul className="space-y-4 text-slate-400 text-sm">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                  <span>Clear visibility into your application status and matching stages.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                  <span>Direct access to official MDA placement details and county assignments.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                  <span>Centralized portal to report field progress and complete program requirements.</span>
                </li>
              </ul>
            </div>

            {/* For ICT Authority Admins Column */}
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">🛡️</span>
                <h3 className="text-xl font-bold text-white">For ICT Authority Admins</h3>
              </div>
              <ul className="space-y-4 text-slate-400 text-sm">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                  <span>Complete oversight of talent pipelines across all 47 counties.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                  <span>Role-based access management to pair interns with specific government MDAs.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                  <span>Automated reporting and cohort performance analytics.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* --- SECTION 5: CALL TO ACTION --- */}
        <section className="max-w-4xl mx-auto text-center px-6 py-20 border-t border-slate-800/60">
          <div className="bg-linear-to-b from-slate-900 to-slate-950 border border-slate-800 p-10 sm:p-14 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl"></div>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Ready to join the pipeline?
            </h2>
            <p className="text-slate-400 text-base sm:text-lg mb-8 max-w-xl mx-auto">
              Whether you're starting your internship or managing national deployments, sign in to access your portal.
            </p>
            <button
              onClick={onNavigateToAuth}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-10 py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all text-base hover:scale-[1.02]"
            >
              Sign Up / Log In
            </button>
          </div>
        </section>

        {/* --- FOOTER --- */}
        <footer className="border-t border-slate-900 bg-slate-950 py-12">
          <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center sm:items-start gap-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center font-bold text-slate-950 text-xs">
                  DT
                </div>
                <span className="font-bold text-white text-base">DevTrack</span>
              </div>
              <p className="text-slate-500 text-xs mt-1">Built for Kenya's digital future.</p>
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-400">
              <button onClick={onNavigateToAuth} className="hover:text-emerald-400 transition-colors">Login</button>
              <a href="#what-it-is" className="hover:text-emerald-400 transition-colors">About</a>
              <a href="#what-it-is" className="hover:text-emerald-400 transition-colors">Contact</a>
            </div>

            <div className="text-xs text-slate-600">
              © {new Date().getFullYear()} DevTrack ICT Pipeline. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
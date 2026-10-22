import React from 'react';
import {
  MapPin,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  UserPlus,
  Target,
  Rocket,
} from 'lucide-react';

const SAMPLE_COUNTIES = [
  { name: 'Nairobi', active: true },
  { name: 'Mombasa', active: true },
  { name: 'Kisumu', active: true },
  { name: 'Nakuru', active: true },
  { name: 'Uasin Gishu', active: true },
  { name: 'Kiambu', active: true },
  { name: 'Machakos', active: false },
  { name: 'Kilifi', active: true },
  { name: 'Kakamega', active: false },
  { name: 'Meru', active: true },
];

export default function LandingPage({ onNavigateToAuth }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-amber-200 selection:text-slate-900">
      <div className="relative z-10">
        {/* --- NAVBAR --- */}
        <nav className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-slate-900 flex items-center justify-center font-bold text-amber-400 text-sm">
                TD
              </div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">
                TalentDeploy
              </span>
            </div>

            <button
              onClick={onNavigateToAuth}
              className="text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-md transition-colors"
            >
              Sign In
            </button>
          </div>
        </nav>

        {/* --- SECTION 1: HERO --- */}
        <section className="max-w-5xl mx-auto text-center px-6 pt-20 pb-16">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold px-4 py-1.5 rounded-full mb-8">
            <MapPin className="w-3.5 h-3.5" />
            ICT Talent Pipeline &amp; County Placement
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight leading-tight mb-6 max-w-3xl mx-auto">
            From registration to county deployment, in one system
          </h1>

          <p className="text-slate-600 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            TalentDeploy tracks ICT internship cohorts end to end — candidate onboarding,
            skills matching, and placement across all 47 counties — replacing spreadsheets
            and email threads with one pipeline.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
            <button
              onClick={onNavigateToAuth}
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-8 py-3.5 rounded-lg transition-colors text-base inline-flex items-center justify-center gap-2"
            >
              Apply Now
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#what-it-is"
              className="w-full sm:w-auto bg-white hover:bg-slate-100 text-slate-700 font-semibold px-8 py-3.5 rounded-lg border border-slate-300 transition-colors text-base text-center"
            >
              See how it works
            </a>
          </div>

          {/* Signature element: live county strip, real content not decoration */}
          <div className="mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm text-left">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">County deployment coverage</h3>
                <p className="text-xs text-slate-500 mt-0.5">Sample of active placement counties, updated per cohort</p>
              </div>
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                47 counties tracked
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_COUNTIES.map((c) => (
                <span
                  key={c.name}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${c.active ? 'bg-amber-500' : 'bg-slate-300'}`}
                  />
                  {c.name}
                </span>
              ))}
              <span className="inline-flex items-center text-xs font-medium text-slate-400 px-3 py-1.5">
                +37 more
              </span>
            </div>
          </div>
        </section>

        {/* --- SECTION 2: HOW IT WORKS (real sequence, numbers earned) --- */}
        <section id="what-it-is" className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-200">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">How TalentDeploy works</h2>
            <p className="text-slate-600">A structured path from application to placement.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: UserPlus,
                step: '01',
                title: 'Register',
                body: 'Create a verified profile, upload credentials, and join an active ICT talent cohort.',
              },
              {
                icon: Target,
                step: '02',
                title: 'Get matched',
                body: 'Your skills are matched against open placements and strategic county projects.',
              },
              {
                icon: Rocket,
                step: '03',
                title: 'Get deployed',
                body: 'Receive your county placement and track progress through the portal in real time.',
              },
            ].map(({ icon: Icon, step, title, body }) => (
              <div
                key={step}
                className="bg-white border border-slate-200 p-8 rounded-xl hover:border-amber-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-11 h-11 bg-slate-900 text-amber-400 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-slate-400">{step}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* --- SECTION 3: STATS --- */}
        <section className="bg-white border-y border-slate-200 py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              <div className="p-4">
                <div className="text-4xl font-bold text-slate-900 mb-1">352</div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">Interns tracked</div>
              </div>
              <div className="p-4 border-t sm:border-t-0 sm:border-x border-slate-200">
                <div className="text-4xl font-bold text-slate-900 mb-1">47</div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">Counties covered</div>
              </div>
              <div className="p-4 border-t sm:border-t-0 border-slate-200">
                <div className="text-4xl font-bold text-slate-900 mb-1">Active</div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">Multiple cohorts</div>
              </div>
            </div>
          </div>
        </section>

        {/* --- SECTION 4: WHO IT'S FOR --- */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Built for the whole pipeline</h2>
            <p className="text-slate-600">Separate portals for candidates and program administrators.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 p-8 rounded-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-amber-700" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">For candidates</h3>
              </div>
              <ul className="space-y-3.5 text-slate-600 text-sm">
                {[
                  'Clear visibility into your application status and matching stage.',
                  'Direct access to placement details and county assignment.',
                  'One place to report field progress and complete program requirements.',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-slate-200 p-8 rounded-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-amber-700" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">For program administrators</h3>
              </div>
              <ul className="space-y-3.5 text-slate-600 text-sm">
                {[
                  'Complete oversight of talent pipelines across all 47 counties.',
                  'Role-based access to pair candidates with active host organizations.',
                  'Cohort performance analytics and placement reporting.',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* --- SECTION 5: CTA --- */}
        <section className="max-w-4xl mx-auto text-center px-6 py-20 border-t border-slate-200">
          <div className="bg-slate-900 p-10 sm:p-14 rounded-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Ready to join the pipeline?
            </h2>
            <p className="text-slate-300 text-base mb-8 max-w-xl mx-auto">
              Whether you're starting an internship or managing regional deployments,
              sign in to access your portal.
            </p>
            <button
              onClick={onNavigateToAuth}
              className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-10 py-3.5 rounded-lg transition-colors text-base"
            >
              Sign Up / Log In
            </button>
          </div>
        </section>

        {/* --- FOOTER --- */}
        <footer className="border-t border-slate-200 bg-white py-12">
          <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center sm:items-start gap-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center font-bold text-amber-400 text-xs">
                  TD
                </div>
                <span className="font-bold text-slate-900 text-base">TalentDeploy</span>
              </div>
              <p className="text-slate-500 text-xs mt-1">ICT talent pipeline & county placement tracking.</p>
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-600">
              <button onClick={onNavigateToAuth} className="hover:text-amber-700 transition-colors">Login</button>
              <a href="#what-it-is" className="hover:text-amber-700 transition-colors">About</a>
              <a href="#what-it-is" className="hover:text-amber-700 transition-colors">Contact</a>
            </div>

            <div className="text-xs text-slate-400">
              © {new Date().getFullYear()} TalentDeploy. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
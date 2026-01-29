import React, { useContext, useMemo, useState, useEffect } from 'react';
import { JobContext } from '../context/JobContext';
import CountyHeatmap from './CountyHeatmap';
import SkillsGapChart from './SkillsGapChart';
import ReportGenerator from './ReportGenerator';
import { fetchAllJobs } from '../services/scrapers/scraperOrchestrator';

export default function MinistryDashboard() {
  const { jobs, setJobs } = useContext(JobContext);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // 1. Calculate statistics using Memo to keep UI snappy
  const stats = useMemo(() => {
    const totalJobs = jobs.length;
    const pscJobs = jobs.filter(j => j.jobSource === 'PSC').length;
    const privateJobs = jobs.filter(j => j.jobSource !== 'PSC').length;

    const byCounty = jobs.reduce((acc, job) => {
      const county = job.county || 'Unknown';
      acc[county] = (acc[county] || 0) + 1;
      return acc;
    }, {});

    const allSkills = jobs.flatMap(j => j.skillsRequired || []);
    const bySkill = allSkills.reduce((acc, skill) => {
      acc[skill] = (acc[skill] || 0) + 1;
      return acc;
    }, {});

    const topSkills = Object.entries(bySkill)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    return { totalJobs, pscJobs, privateJobs, byCounty, bySkill, topSkills };
  }, [jobs]);

  // 2. Fetch jobs from Local Storage on mount
  useEffect(() => {
    const savedJobs = localStorage.getItem('ministry-jobs');
    const savedDate = localStorage.getItem('ministry-last-update');
    if (savedJobs) {
      setJobs(JSON.parse(savedJobs));
      setLastUpdated(savedDate);
    }
  }, [setJobs]);

  // 3. Data Refresh Logic
  const handleRefreshJobs = async () => {
    setIsLoading(true);
    try {
      const apiKey = import.meta.env.VITE_JSEARCH_API_KEY;
      const newJobs = await fetchAllJobs(apiKey);

      // Sync with your backend
      await fetch('http://localhost:3000/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJobs)
      });

      setJobs(newJobs);
      const now = new Date().toISOString();
      setLastUpdated(now);
      localStorage.setItem('ministry-jobs', JSON.stringify(newJobs));
      localStorage.setItem('ministry-last-update', now);

      alert(`✅ Database Updated: ${newJobs.length} records synced.`);
    } catch (error) {
      alert('❌ Error loading jobs. Please check your connection or API key.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* HEADER CARD */}
        <header className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              ICT Talent Pipeline Dashboard
            </h1>
            <p className="text-slate-500 font-medium">
              Ministry of ICT & Digital Economy | Workforce Intelligence
            </p>
            {lastUpdated && (
              <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600 font-bold">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                LAST SYNC: {new Date(lastUpdated).toLocaleString()}
              </div>
            )}
          </div>

          <button
            onClick={handleRefreshJobs}
            disabled={isLoading}
            className="group px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 active:scale-95 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center gap-3 shadow-lg shadow-blue-200"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                SYNCING DATA...
              </span>
            ) : (
              <><span>🔄</span> REFRESH WORKFORCE DATA</>
            )}
          </button>
        </header>

        {/* STATS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total ICT Vacancies" value={stats.totalJobs} icon="📊" color="blue" />
          <StatCard title="PSC Openings" value={stats.pscJobs} icon="🏛️" color="green" subtitle="Public Service Commission" />
          <StatCard title="Private Sector" value={stats.privateJobs} icon="💼" color="purple" />
          <StatCard title="High Demand Skill" value={stats.topSkills[0]?.[0] || 'N/A'} icon="⚡" color="orange" subtitle={`${stats.topSkills[0]?.[1] || 0} Open Positions`} />
        </div>

        {/* MAIN VISUALIZATION GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Kenya Heatmap (7/12 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl shadow-sm border border-slate-200 p-2">
            <CountyHeatmap data={stats.byCounty} />
          </div>

          {/* Right: Skills Gap & Report (5/12 cols) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span>📈</span> Skills Demand Analysis
              </h3>
              <SkillsGapChart data={stats.bySkill} />
            </div>

            <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl">
              <ReportGenerator jobs={jobs} stats={stats} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Visual StatCard Component
function StatCard({ title, value, icon, color, subtitle }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100'
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm p-6 border ${colors[color]} border-b-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
          <p className="text-3xl font-black text-slate-900">{value}</p>
          {subtitle && <p className="text-slate-400 text-[10px] mt-1 font-medium italic">{subtitle}</p>}
        </div>
        <div className={`text-3xl ${colors[color].split(' ')[0]} p-4 rounded-xl`}>{icon}</div>
      </div>
    </div>
  );
}
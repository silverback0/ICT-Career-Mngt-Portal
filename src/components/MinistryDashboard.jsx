import React, { useContext, useMemo, useState } from 'react';
import { JobContext } from '../context/JobContext';
import CountyHeatmap from './CountyHeatmap';
import SkillsGapChart from './SkillsGapChart';
import PlacementModal from './PlacementModal'; 
import PlacementTrendChart from './PlacementTrendChart';
import { fetchAllJobs } from '../services/scrapers/scraperOrchestrator';

export default function MinistryDashboard() {
  const { jobs, setJobs, updateJob } = useContext(JobContext); 
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState(null);

  const stats = useMemo(() => {
    const safeJobs = Array.isArray(jobs) ? jobs : [];
    
    const pscJobs = safeJobs.filter(j => 
      j?.jobSource === 'PSC' || 
      /Ministry|State Department|County Government|Authority|Commission|Govt/i.test(j?.company || '')
    ).length;

    const privateJobs = safeJobs.length - pscJobs;

    const pnpEligible = safeJobs.filter(j => 
      (j?.history?.length > 0 || j?.isVerified) && 
      j?.suitabilityScore >= 80 &&
      j?.status !== "Placed (Public)"
    ).length;

    const byCounty = safeJobs.reduce((acc, job) => {
      const county = job?.county || 'Unknown';
      acc[county] = (acc[county] || 0) + 1;
      return acc;
    }, {});

    const bySkill = safeJobs.flatMap(j => Array.isArray(j?.skillsRequired) ? j.skillsRequired : [])
      .reduce((acc, skill) => {
        if (skill) acc[skill] = (acc[skill] || 0) + 1;
        return acc;
      }, {});

    return { 
      totalJobs: safeJobs.length, 
      pscJobs, 
      privateJobs, 
      pnpEligible, 
      byCounty, 
      bySkill 
    };
  }, [jobs]);

  const handleRefreshJobs = async () => {
    setIsLoading(true);
    try {
      const apiKey = import.meta.env.VITE_JSEARCH_API_KEY;
      const newJobs = await fetchAllJobs(apiKey);
      await fetch('http://localhost:5000/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJobs)
      });
      setJobs(newJobs); 
      alert(`✅ Data Sync Complete!`);
    } catch (error) {
      console.error(error);
      alert("❌ Sync failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10 relative">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* HEADER */}
        <header className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">ICT Talent Pipeline</h1>
            <p className="text-slate-500 font-medium italic">Ministry of Information, Communications and The Digital Economy</p>
          </div>
          <button
            onClick={handleRefreshJobs}
            disabled={isLoading}
            className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 disabled:bg-slate-300 transition-all shadow-lg"
          >
            {isLoading ? "SYNCING..." : "🔄 REFRESH WORKFORCE DATA"}
          </button>
        </header>

        {/* STATS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Workforce" value={stats.totalJobs} icon="👥" color="blue" />
          <StatCard title="Public Service" value={stats.pscJobs} icon="🏛️" color="green" />
          <StatCard title="Private Sector" value={stats.privateJobs} icon="💼" color="purple" />
          <StatCard title="PnP Eligible" value={stats.pnpEligible} icon="⭐" color="orange" />
        </div>

        {/* MAIN VISUALIZATION GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Map & Trend (7/12) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-900">National Deployment Map</h3>
              <p className="text-sm text-slate-500 mb-4">Regional distribution of ICT talent</p>
              <CountyHeatmap data={stats.byCounty} />
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">🚀 Placement Success Trend</h3>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">+12% growth</span>
              </div>
              <PlacementTrendChart jobs={jobs} />
            </div>
          </div>

          {/* RIGHT COLUMN: Skills & Priority List (5/12) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">📈 Skills Demand</h3>
              <SkillsGapChart data={stats.bySkill} />
            </div>

            <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-orange-400">⚡</span> Priority PnP Candidates
              </h3>
              <div className="space-y-4">
                {jobs
                  .filter(j => j.suitabilityScore >= 90 && j.status !== "Placed (Public)")
                  .slice(0, 4) // Show top 4
                  .map(person => (
                  <div key={person.id} className="flex justify-between items-center p-3 bg-slate-800 rounded-xl border border-slate-700 group">
                    <div>
                      <p className="font-bold text-sm">{person.name}</p>
                      <p className="text-[10px] text-slate-400">Prev: {person.history?.[0]?.organization || person.previousMDA || 'Ex-Intern'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-orange-400">{person.suitabilityScore}%</span>
                      <button 
                        onClick={() => setSelectedTalent(person)}
                        className="bg-blue-600 px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-blue-500 opacity-0 group-hover:opacity-100 transition-all uppercase"
                      >
                        Place
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedTalent && (
        <PlacementModal 
          person={selectedTalent} 
          onClose={() => setSelectedTalent(null)}
          onConfirm={async (updatedData) => {
            await updateJob(updatedData);
            setSelectedTalent(null);
            alert(`Success! ${updatedData.name} placed.`);
          }}
        />
      )}
    </div>
  );
}

// Simple internal StatCard component
function StatCard({ title, value, icon, color }) {
  const styles = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-emerald-50 text-emerald-600 border-emerald-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200"
  };
  return (
    <div className={`p-6 rounded-2xl border-b-4 ${styles[color]} bg-white shadow-sm flex justify-between items-center`}>
      <div>
        <p className="text-xs font-bold uppercase text-slate-500">{title}</p>
        <p className="text-2xl font-black text-slate-900">{value}</p>
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
  );
}
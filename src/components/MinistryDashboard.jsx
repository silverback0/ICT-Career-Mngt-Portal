import React, { useContext, useMemo, useState } from 'react';
import { JobContext } from '../context/JobContext';
import CountyHeatmap from './CountyHeatmap';
import SkillsGapChart from './SkillsGapChart';
import PlacementModal from './PlacementModal'; 
import PlacementTrendChart from './PlacementTrendChart';
import { fetchAllJobs } from '../services/scrapers/scraperOrchestrator';

// Professional Lucide Icons
import { 
  Users, 
  Building2, 
  Briefcase, 
  ShieldCheck, 
  RefreshCw, 
  Map as MapIcon, 
  BarChart3, 
  History,
  CheckCircle2,
  Clock,
  TrendingUp,
  Search
} from 'lucide-react';

export default function MinistryDashboard() {
  const { jobs, setJobs, updateJob } = useContext(JobContext); 
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState(null);
  const [selectedCohort, setSelectedCohort] = useState("");

  const stats = useMemo(() => {
    const safeJobs = Array.isArray(jobs) ? jobs : [];
    
    // 1. Filter by Cohort if selected
    let filteredJobs = safeJobs;
    if (selectedCohort) {
      filteredJobs = safeJobs.filter(j => j.history?.some(h => h.period === selectedCohort));
    }
    
    // 2. Calculate Public vs Private
    const pscJobs = filteredJobs.filter(j => 
      j?.jobSource === 'PSC' || 
      /Ministry|State Department|County Government|Authority|Commission|Govt/i.test(j?.company || '')
    ).length;

    // 3. Evaluation Logic: PnP Eligible must be Vetted AND not yet placed in Public
    const pnpEligible = filteredJobs.filter(j => 
      j?.vettingStatus === "Vetted" && 
      j?.status !== "Placed (Public)"
    ).length;

    // 4. Distribution Aggregates
    const byCounty = filteredJobs.reduce((acc, job) => {
      const county = job?.county || 'Unknown';
      acc[county] = (acc[county] || 0) + 1;
      return acc;
    }, {});

    const bySkill = filteredJobs.flatMap(j => Array.isArray(j?.skillsRequired) ? j.skillsRequired : [])
      .reduce((acc, skill) => {
        if (skill) acc[skill] = (acc[skill] || 0) + 1;
        return acc;
      }, {});

    return { 
      totalJobs: filteredJobs.length, 
      pscJobs, 
      privateJobs: filteredJobs.length - pscJobs, 
      pnpEligible, 
      byCounty, 
      bySkill 
    };
  }, [jobs, selectedCohort]);

  const handleRefreshJobs = async () => {
    setIsLoading(true);
    try {
      // Instead of scraping, we fetch the "Master Data" from your backend
      const response = await fetch('http://localhost:5000/jobs');
      if (!response.ok) throw new Error("Database offline");
      
      const data = await response.json();
      setJobs(data); 
      
      alert(`✅ Pipeline Synced: ${data.length} records updated from National Database.`);
    } catch (error) {
      console.error("Sync Error:", error);
      alert("❌ System Offline: Ensure your JSON Server is running (npm run dev-server)");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 relative text-slate-900 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* AUTHENTIC HEADER */}
        <header className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="bg-blue-700 p-3 rounded-xl shadow-lg shadow-blue-100">
              <Building2 className="text-white w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">ICT Talent Pipeline</h1>
              <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                <span>Ministry of Information & Digital Economy</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span className="text-blue-600">Verification & Placement</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center gap-3">
              <History className="w-4 h-4 text-slate-400 ml-2" />
              <select 
                onChange={(e) => setSelectedCohort(e.target.value)}
                className="bg-transparent text-sm font-bold text-slate-700 outline-none pr-4 cursor-pointer"
              >
                <option value="">All Cohorts</option>
                <option value="2022/23">Cohort 2022/23</option>
                <option value="2023/24">Cohort 2023/24</option>
                <option value="2024/25">Cohort 2024/25</option>
              </select>
            </div>

            <button
              onClick={handleRefreshJobs}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:bg-slate-300 transition-all flex items-center gap-2 shadow-md shadow-blue-100"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? "Syncing..." : "Refresh Data"}
            </button>
          </div>
        </header>

        {/* STATS ROW - Using Lucide Components */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Workforce" value={stats.totalJobs} icon={<Users />} color="blue" />
          <StatCard title="Public Service" value={stats.pscJobs} icon={<Building2 />} color="green" />
          <StatCard title="Private Sector" value={stats.privateJobs} icon={<Briefcase />} color="purple" />
          <StatCard title="PnP Eligible" value={stats.pnpEligible} icon={<ShieldCheck />} color="orange" />
        </div>

        {/* MAIN VISUALIZATION GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Map & Trend */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <MapIcon className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-bold text-slate-900">National Deployment Map</h3>
              </div>
              <CountyHeatmap data={stats.byCounty} />
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-xl font-bold text-slate-900">Placement Success Trend</h3>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">+12% growth</span>
              </div>
              <PlacementTrendChart jobs={jobs} />
            </div>
          </div>

          {/* RIGHT COLUMN: Skills & Priority List */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center gap-3 mb-8">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <h3 className="text-xl font-bold text-slate-900">High-Demand Skills</h3>
              </div>
              <SkillsGapChart data={stats.bySkill} />
            </div>

            <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-3 mb-8 relative z-10">
                <ShieldCheck className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-bold">Priority PnP Candidates</h3>
              </div>
              
              <div className="space-y-4 relative z-10">
                {jobs
                  .filter(j => j.suitabilityScore >= 90 && j.status !== "Placed (Public)")
                  .slice(0, 5) 
                  .map(person => (
                  <div key={person.id} className="flex justify-between items-center p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 group hover:border-blue-500/50 transition-all">
                    <div>
                      <p className="font-bold text-sm text-slate-100">{person.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {person.history?.[0]?.organization || person.previousMDA || 'Internship Completed'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end gap-1">
                        {person.vettingStatus === "Vetted" ? (
                          <span className="flex items-center gap-1 text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20 font-bold uppercase tracking-wider">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Vetted
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[9px] bg-slate-700 text-slate-400 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                            <Clock className="w-2.5 h-2.5" /> Pending
                          </span>
                        )}
                        <span className="text-xs font-black text-orange-400">{person.suitabilityScore}% Match</span>
                      </div>
          
                      <button 
                        onClick={() => setSelectedTalent(person)}
                        className="bg-blue-600 p-2 rounded-lg hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20"
                      >
                        <Search className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL LAYER */}
      {selectedTalent && (
        <PlacementModal 
          person={selectedTalent} 
          onClose={() => setSelectedTalent(null)}
          onConfirm={async (updatedData) => {
            await updateJob(updatedData);
            setSelectedTalent(null);
          }}
        />
      )}
    </div>
  );
}

// Professional StatCard Component
function StatCard({ title, value, icon, color }) {
  const themes = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    green: "text-emerald-600 bg-emerald-50 border-emerald-100",
    purple: "text-purple-600 bg-purple-50 border-purple-100",
    orange: "text-orange-600 bg-orange-50 border-orange-100"
  };

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex justify-between items-center group hover:shadow-md transition-all duration-300">
      <div>
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] mb-1">{title}</p>
        <p className="text-3xl font-black text-slate-900">{value.toLocaleString()}</p>
      </div>
      <div className={`p-4 rounded-xl transition-transform group-hover:scale-110 ${themes[color]}`}>
        {React.cloneElement(icon, { size: 22, strokeWidth: 2.5 })}
      </div>
    </div>
  );
}
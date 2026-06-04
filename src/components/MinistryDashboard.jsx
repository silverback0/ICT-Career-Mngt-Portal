import React, { useState, useEffect, useMemo } from 'react';
import CountyHeatmap from './CountyHeatmap';
import SkillsGapChart from './SkillsGapChart';
import PlacementModal from './PlacementModal'; 
import PlacementTrendChart from './PlacementTrendChart';
import { exportToPDF } from '../utils/exportReport';
import AddTalentModal from './AddTalentModal';
import { supabase } from '../supabaseClient'; // Adjusted to point to your Supabase configuration

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
  FileDown,
  Search,
  Trash2
} from 'lucide-react';

export default function MinistryDashboard() {
  // Localized states replacing the legacy local JobContext tracking system
  const [talents, setTalents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState('');
  const [filterCounty, setFilterCounty] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTalent, setSelectedTalent] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // 1. Core Supabase Data Hydration Hook
  const handleRefreshJobs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('talents')
        .select('*, talent_skills ( skill_name )');

      if (error) throw error;

      // Map Supabase layout schema straight into your existing component parameters
      const normalizedData = (data || []).map(t => ({
        id: t.id,
        // Correctly mapping to the 'name' column from your DB
        name: t.name || 'Anonymous Intern', 
        company: t.position || 'General Track', 
        county: t.county || 'Unknown',
        cohort: t.cohort || '',
        status: t.status || 'National Pipeline',
        suitabilityScore: t.suitability_score || 0,
        // Adjusting vetting status based on your varchar column
        vettingStatus: t.vetting_status === "Vetted" ? "Vetted" : "Pending",
        // Ensure this points to the column where your skills data is actually stored
        skillsRequired: t.talent_skills ? t.talent_skills.map(s => s.skill_name) : [] 
      }));

      setTalents(normalizedData);
    } catch (err) {
      console.error("System Fetch Error:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data immediately upon dashboard activation
  useEffect(() => {
    handleRefreshJobs();
  }, []);

  // 2. Local Dynamic Filtering Layer
  const filteredJobs = useMemo(() => {
    return talents.filter(j => {
      const matchesSearch = (j.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (j.company || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCohort = !selectedCohort || j.cohort === selectedCohort;
      const matchesCounty = filterCounty === 'All' || j.county === filterCounty;
      
      return matchesSearch && matchesCohort && matchesCounty;
    });
  }, [talents, searchTerm, selectedCohort, filterCounty]);

  // 3. Analytics engine recalculating when filtered data objects change
  const stats = useMemo(() => {
    const dataForStats = Array.isArray(filteredJobs) ? filteredJobs : [];
    
    const pscJobs = dataForStats.filter(j => 
      j?.status === "Placed (Public)" || 
      /Ministry|State Department|County Government|Authority|Commission|Govt/i.test(j?.company || '')
    ).length;

    const pnpEligible = dataForStats.filter(j => 
      j?.vettingStatus === "Vetted" && j?.status !== "Placed (Public)"
    ).length;

    const byCounty = dataForStats.reduce((acc, job) => {
      const county = job?.county || 'Unknown';
      acc[county] = (acc[county] || 0) + 1;
      return acc;
    }, {});

    const bySkillObj = dataForStats.reduce((acc, job) => {
      const rawSkills = job.skillsRequired || [];
      let skillsArray = [];
      
      if (Array.isArray(rawSkills)) {
        skillsArray = rawSkills;
      } else if (typeof rawSkills === 'string') {
        skillsArray = rawSkills.split(',').map(s => s.trim());
      }

      skillsArray.forEach(skill => {
        if (skill) acc[skill] = (acc[skill] || 0) + 1;
      });
      
      return acc;
    }, {});

    const skillsArray = Object.entries(bySkillObj)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    return { 
      totalJobs: dataForStats.length, 
      pscJobs, 
      privateJobs: dataForStats.length - pscJobs, 
      pnpEligible, 
      byCounty, 
      bySkill: skillsArray 
    };
  }, [filteredJobs]);

  // 4. Mutation Handlers pointed to your live database
  const addJob = async (newData) => {
    try {
      const { error } = await supabase.from('talents').insert([{
        full_name: newData.name,
        position: newData.company,
        county: newData.county,
        cohort: newData.cohort,
        suitability_score: newData.suitabilityScore || 0,
        status: newData.status || 'National Pipeline'
      }]);
      if (error) throw error;
      handleRefreshJobs();
    } catch (err) {
      alert(`Could not save asset: ${err.message}`);
    }
  };

  const updateJob = async (updatedData) => {
    try {
      const { error } = await supabase
        .from('talents')
        .update({
          full_name: updatedData.name,
          position: updatedData.company,
          county: updatedData.county,
          status: updatedData.status,
          suitability_score: updatedData.suitabilityScore
        })
        .eq('id', updatedData.id);

      if (error) throw error;
      handleRefreshJobs();
    } catch (err) {
      console.error(err);
      alert("❌ System Error: Could not update record.");
    }
  };

  const deleteJob = async (id) => {
    try {
      const { error } = await supabase.from('talents').delete().eq('id', id);
      if (error) throw error;
      setTalents(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      alert(`Could not delete record: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 relative text-slate-900 font-sans">
      <div id="dashboard-report-target" className="max-w-400 mx-auto space-y-8">
        
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
            {/* SEARCH INPUT BAR */}
            <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search candidates..." 
                className="bg-transparent text-xs font-bold text-slate-700 outline-none w-40"
              />
            </div>

            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center gap-3">
              <History className="w-4 h-4 text-slate-400 ml-2" />
              <select 
                onChange={(e) => setSelectedCohort(e.target.value)}
                className="bg-transparent text-sm font-bold text-slate-700 outline-none pr-4 cursor-pointer"
              >
                <option value="">All Cohorts</option>
                <option value="Cohort 2022/23">Cohort 2022/23</option>
                <option value="Cohort 2023/24">Cohort 2023/24</option>
                <option value="Cohort 2024/25">Cohort 2024/25</option>
              </select>
            </div>

            {filterCounty !== 'All' && (
              <button 
                onClick={() => setFilterCounty('All')}
                className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-xl border border-red-100 hover:bg-red-100 transition-colors shadow-sm animate-in fade-in zoom-in duration-200"
              >
                <span className="text-xs font-black uppercase tracking-wider">County: {filterCounty}</span>
                <span className="font-bold">✕</span>
              </button>
            )}

            <button onClick={handleRefreshJobs} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100">
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button onClick={() => setIsAddModalOpen(true)} className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl flex items-center gap-2">
              <span>+ Add Talent</span>
            </button>

            <button onClick={() => exportToPDF('dashboard-report-target')} className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl flex items-center gap-2">
              <FileDown className="w-4 h-4" />
              Export to PDF
            </button>
          </div>
        </header>

        {/* STATS ROW */}
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
              <CountyHeatmap 
                data={stats.byCounty} 
                selectedCounty={filterCounty} 
                onCountyClick={(name) => setFilterCounty(name)} 
              />
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-xl font-bold text-slate-900">Placement Success Trend</h3>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">+12% growth</span>
              </div>
              <PlacementTrendChart jobs={filteredJobs} />
            </div>
          </div>

          {/* RIGHT COLUMN: Skills & Priority List */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center gap-3 mb-8">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <h3 className="text-xl font-bold text-slate-900">High-Demand Skills</h3>
              </div>
              <div>
                 <SkillsGapChart data={stats.bySkill || []} />
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-3 mb-8 relative z-10">
                <ShieldCheck className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-bold">Priority PnP Candidates</h3>
              </div>
              
              <div className="space-y-4 relative z-10">
                {filteredJobs
                  .filter(j => j.suitabilityScore >= 90 && j.status !== "Placed (Public)")
                  .slice(0, 5) 
                  .map(person => (
                  <div key={person.id} className="flex justify-between items-center p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 group hover:border-blue-500/50 transition-all">
                    <div>
                      <p className="font-bold text-sm text-slate-100">{person.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {person.company}
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
                        title="View Details"
                      >
                        <Search className="w-4 h-4 text-white" />
                      </button>

                      <button
                        onClick={() => {
                         if(window.confirm(`Remove ${person.name} from the pipeline?`)) {
                              deleteJob(person.id);
                         }
                        }}
                        className="bg-red-600 p-2 rounded-lg hover:bg-red-500 transition-all shadow-lg shadow-red-900/20"
                        title="Remove from Pipeline"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
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
      <AddTalentModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={(newData) => addJob(newData)} 
      />
    </div>
  );
}

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
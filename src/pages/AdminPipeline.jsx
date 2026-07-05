import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Ensure correct path to your client
import toast, { Toaster } from 'react-hot-toast';
import { 
  List, 
  Kanban, 
  LogOut, 
  MapPin, 
  X, 
  RefreshCw, 
  ShieldCheck, 
  Zap, 
  GraduationCap 
} from 'lucide-react';

const AdminPipeline = () => {
  const [viewType, setViewType] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCohort, setSelectedCohort] = useState('All');
  const [selectedIntern, setSelectedIntern] = useState(null);
  
  const [interns, setInterns] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // 1. ASYNC FETCH: Pull flat records directly from the talents table
  const fetchLiveCohortData = async () => {
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('talents')
        .select(`*`);

      if (error) throw error;

      // Map properties directly from the flat object structure provided by the table
      const flattenedRecords = (data || []).map(talent => {
        return {
          id: talent.id,
          name: talent.name || 'Anonymous Intern',
          track: talent.position || 'General Track',
          county: talent.county || 'Unassigned',
          cohort: talent.cohort || 'Undefined Cohort',
          status: talent.status || 'National Pipeline', // Default fallback stage
          technicalScore: talent.suitability_score || 0,
          ethicScore: talent.vetting_status || 0,
          supervisorNotes: talent.supervisor_notes || 'No evaluations logged yet.'
        };
      });

      setInterns(flattenedRecords);
    } catch (err) {
      console.error("Critical error building cohort view:", err.message);
      toast.error(`Failed to load cohort data: ${err.message}`);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchLiveCohortData();
  }, []);

  // 2. ASYNC UPDATE: Mutate status column inside Supabase talents table
  const updateInternStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('talents')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      // Optimistically update frontend interface state instantly
      setInterns(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
      if (selectedIntern && selectedIntern.id === id) {
        setSelectedIntern(prev => ({ ...prev, status: newStatus }));
      }
      
      toast.success(`Pipeline status updated successfully!`);
    } catch (err) {
      toast.error(`Database rejected modification: ${err.message}`);
    }
  };

  // 3. ADMIN LOGOUT: Clear session and trigger App.jsx redirect
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Signed out successfully');
    } catch (err) {
      toast.error(`Logout failed: ${err.message}`);
    }
  };

  // Extract unique cohorts dynamically from data to ensure database items aren't filtered out
  const dynamicCohorts = ['All', ...new Set(interns.map(item => item.cohort).filter(Boolean))];

  // Filter Engine Computed States
  const filteredInterns = interns.filter(intern => {
    const matchesSearch = intern.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          intern.track.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCohort = selectedCohort === 'All' || intern.cohort === selectedCohort;
    return matchesSearch && matchesCohort;
  });

  const pipelineStages = [
    { id: 'National Pipeline', title: 'National Pipeline' },
    { id: 'Verification Phase', title: 'Verification Phase' },
    { id: 'MDA Rotation', title: 'MDA Rotation (Active)' },
    { id: 'Deployment Ready', title: 'Deployment Ready' },
    { id: 'Placed (Public)', title: 'Placed (Public)' },
    { id: 'Placed (Private)', title: 'Placed (Private)' },
    { id: 'Attrition/Inactive', title: 'Attrition / Inactive' }
  ];

  if (loadingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-3">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500 tracking-wide">Syncing live cohort metrics from Supabase...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 p-6 font-sans antialiased text-slate-800">
      
      {/* CONTROL DASHBOARD HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Operations Command</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track deployment statuses, update performance indices, and dispatch cohort parameters.</p>
        </div>
        
        <div className="flex items-center gap-3 self-end lg:self-center">
          {/* VIEW TOGGLER PANEL */}
          <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl border border-slate-300/40">
            <button 
              onClick={() => setViewType('list')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${viewType === 'list' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <List className="w-3.5 h-3.5" /> Cohort List View
            </button>
            <button 
              onClick={() => setViewType('kanban')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${viewType === 'kanban' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Kanban className="w-3.5 h-3.5" /> Rotation Kanban
            </button>
          </div>

          {/* ADMIN ACTION LOGOUT BUTTON */}
          <button 
            onClick={handleLogout}
            className="px-4 py-2 text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>

      {/* FILTER SEARCH UTILITY INPUTS */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-1 min-w-70 gap-3">
          <input 
            type="text" 
            placeholder="Search interns by name or functional track..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-slate-50/50 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
          />
          <select 
            value={selectedCohort} 
            onChange={(e) => setSelectedCohort(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg p-2.5 bg-slate-50/50 outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            {dynamicCohorts.map(cohort => (
              <option key={cohort} value={cohort}>
                {cohort === 'All' ? 'All Cohorts' : cohort}
              </option>
            ))}
          </select>
        </div>
        <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          Showing <span className="text-slate-900 font-bold">{filteredInterns.length}</span> of {interns.length} Active Profiles
        </div>
      </div>

      {/* MAIN LAYOUT CANVAS SEPARATOR */}
      {viewType === 'list' ? (
        /* VIEW 1: DYNAMIC COHORT DATA TABLE LIST */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Full Name</th>
                  <th className="p-4">ICT Specialty</th>
                  <th className="p-4">Home County</th>
                  <th className="p-4">Cohort Group</th>
                  <th className="p-4">Current Pipeline Status</th>
                  <th className="p-4 text-center">Tech Rating</th>
                  <th className="p-4 text-right">Operational Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredInterns.map((intern) => (
                  <tr key={intern.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 font-semibold text-slate-900">{intern.name}</td>
                    <td className="p-4 text-slate-600">{intern.track}</td>
                    <td className="p-4 text-slate-600">{intern.county}</td>
                    <td className="p-4 text-slate-400 text-xs font-medium">{intern.cohort}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-teal-50 text-teal-700 border border-teal-100">
                        {intern.status}
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold text-emerald-600">{intern.technicalScore}%</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setSelectedIntern(intern)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-teal-600 hover:text-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition"
                      >
                        Evaluate Profile
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredInterns.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400 italic bg-white">
                      No matching records discovered inside this context layer.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* VIEW 3: PIPELINE KANBAN COLUMNS CANVAS */
        <div className="overflow-x-auto pb-4 scrollbar-thin">
          <div className="flex gap-4 items-start min-w-max px-0.5">
            {pipelineStages.map((stage) => {
              const stageInterns = filteredInterns.filter(i => i.status === stage.id);
              return (
                <div key={stage.id} className="w-72 bg-slate-100/80 border border-slate-200 rounded-xl p-3 flex flex-col max-h-[70vh]">
                  <div className="flex justify-between items-center mb-3 px-1">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide truncate w-48">{stage.title}</h3>
                    <span className="text-xs font-bold bg-slate-200/80 px-2 py-0.5 rounded-full text-slate-600">{stageInterns.length}</span>
                  </div>
                  
                  <div className="space-y-2.5 overflow-y-auto flex-1 min-h-62.5">
                    {stageInterns.map(intern => (
                      <div 
                        key={intern.id}
                        onClick={() => setSelectedIntern(intern)}
                        className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm hover:shadow hover:border-teal-500/40 cursor-pointer transition-all"
                      >
                        <h4 className="font-semibold text-slate-800 text-sm tracking-tight">{intern.name}</h4>
                        <p className="text-xs text-slate-500 mt-1">{intern.track}</p>
                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {intern.county}</span>
                          <span className="font-bold text-emerald-600">{intern.technicalScore}%</span>
                        </div>
                      </div>
                    ))}
                    {stageInterns.length === 0 && (
                      <div className="border border-dashed border-slate-300/60 rounded-xl h-24 flex items-center justify-center text-slate-400 text-xs italic">
                        Empty Sector Stage
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: FULL DETAIL INTERN SLIDE-OUT MODAL OVERLAY */}
      {selectedIntern && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end transition-opacity">
          <div className="w-full max-w-xl bg-white h-screen shadow-2xl flex flex-col border-l border-slate-200">
            
            {/* Modal Header Banner */}
            <div className="bg-slate-900 p-6 text-white flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-teal-400 bg-teal-950/60 border border-teal-800 px-2 py-1 rounded-md uppercase tracking-wider">{selectedIntern.cohort}</span>
                <h2 className="text-xl font-bold mt-2 tracking-tight">{selectedIntern.name}</h2>
                <p className="text-sm text-slate-400 mt-0.5">{selectedIntern.email}</p>
              </div>
              <button 
                onClick={() => setSelectedIntern(null)}
                className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Variable Metrics Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Technical Ratings Performance Sections */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Core Score Performance Metric</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl">
                    <span className="text-xs text-slate-500 font-medium">Technical Proficiency</span>
                    <div className="text-2xl font-bold text-teal-600 mt-1">{selectedIntern.technicalScore}%</div>
                  </div>
                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl">
                    <span className="text-xs text-slate-500 font-medium">Work Ethic & Delivery</span>
                    <div className="text-2xl font-bold text-indigo-600 mt-1">
                      {typeof selectedIntern.ethicScore === 'number' ? `${selectedIntern.ethicScore}%` : selectedIntern.ethicScore}
                    </div>
                  </div>
                </div>
              </div>

              {/* Geographic Data Coordinates */}
              <div className="border-t border-slate-100 pt-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Geographic & Core Classification</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 block">Assigned Specialty Track</span>
                    <span className="font-semibold text-slate-800">{selectedIntern.track}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Home County Origin</span>
                    <span className="font-semibold text-slate-800">{selectedIntern.county}</span>
                  </div>
                </div>
              </div>

              {/* Feedback Text Area Field Logger Logs */}
              <div className="border-t border-slate-100 pt-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Field Supervisor Evaluation Notes</h3>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm italic text-slate-600 leading-relaxed">
                  "{selectedIntern.supervisorNotes}"
                </div>
              </div>

              {/* LIVE ACTION BUTTONS MUTATORS PANEL */}
              <div className="border-t border-slate-100 pt-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Execute Strategic Pipeline Allocations</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button 
                    onClick={() => updateInternStatus(selectedIntern.id, 'MDA Rotation')}
                    className={`p-2.5 text-xs text-left font-bold rounded-lg border transition flex items-center justify-between ${selectedIntern.status === 'MDA Rotation' ? 'bg-teal-50 border-teal-200 text-teal-700' : 'border-slate-200 hover:bg-slate-50'}`}
                  >
                    <span className="flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5" /> Assign to Active MDA Rotation</span>
                    <span>{selectedIntern.status === 'MDA Rotation' ? '✓' : '→'}</span>
                  </button>
                  <button 
                    onClick={() => updateInternStatus(selectedIntern.id, 'Verification Phase')}
                    className={`p-2.5 text-xs text-left font-bold rounded-lg border transition flex items-center justify-between ${selectedIntern.status === 'Verification Phase' ? 'bg-teal-50 border-teal-200 text-teal-700' : 'border-slate-200 hover:bg-slate-50'}`}
                  >
                    <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Initiate Interview Verification</span>
                    <span>{selectedIntern.status === 'Verification Phase' ? '✓' : '→'}</span>
                  </button>
                  <button 
                    onClick={() => updateInternStatus(selectedIntern.id, 'Deployment Ready')}
                    className={`p-2.5 text-xs text-left font-bold rounded-lg border transition flex items-center justify-between ${selectedIntern.status === 'Deployment Ready' ? 'bg-teal-50 border-teal-200 text-teal-700' : 'border-slate-200 hover:bg-slate-50'}`}
                  >
                    <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Add to Cabinet Fast-Track Pool</span>
                    <span>{selectedIntern.status === 'Deployment Ready' ? '✓' : '→'}</span>
                  </button>
                  <button 
                    onClick={() => updateInternStatus(selectedIntern.id, 'Placed (Public)')}
                    className={`p-2.5 text-xs text-left font-bold border transition flex items-center justify-between ${selectedIntern.status === 'Placed (Public)' ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-teal-600 border-teal-700 text-white hover:bg-teal-700'}`}
                  >
                    <span className="flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" /> Finalize Public Sector Placement</span>
                    <span>{selectedIntern.status === 'Placed (Public)' ? '✓' : '→'}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPipeline;
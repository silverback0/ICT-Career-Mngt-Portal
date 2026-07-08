import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
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
  GraduationCap,
  Award,
  Edit3,
  Save,
  XCircle
} from 'lucide-react';

const AdminPipeline = () => {
  const [viewType, setViewType]             = useState('list');
  const [searchQuery, setSearchQuery]       = useState('');
  const [selectedCohort, setSelectedCohort] = useState('All');
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [interns, setInterns]               = useState([]);
  const [loadingData, setLoadingData]       = useState(true);

  // Edit Scores state
  const [editingScores, setEditingScores] = useState(false);
  const [scoreForm, setScoreForm]         = useState({
    technical_proficiency: '',
    work_ethic: '',
    supervisor_comments: ''
  });
  const [savingScores, setSavingScores] = useState(false);

  // ── 1. FETCH talents + verified_scores ──────────────────────────────────────
  const fetchLiveCohortData = async () => {
    setLoadingData(true);
    try {
      const { data: talentsData, error: talentsError } = await supabase
        .from('talents')
        .select('*');
      if (talentsError) throw talentsError;

      const { data: scoresData } = await supabase
        .from('verified_scores')
        .select('*');

      // Build lookup: intern_id → score record
      const scoresMap = {};
      (scoresData || []).forEach(s => { scoresMap[s.intern_id] = s; });

      const flattenedRecords = (talentsData || []).map(talent => {
        const score = scoresMap[talent.id] || {};
        return {
          id:               talent.id,
          name:             talent.name            || 'Anonymous Intern',
          email:            talent.email           || '—',
          track:            talent.position        || 'General Track',
          county:           talent.county          || 'Unassigned',
          cohort:           talent.cohort          || 'Undefined Cohort',
          status:           talent.status          || 'National Pipeline',
          company:          talent.company         || 'Unassigned',
          suitabilityScore: talent.suitability_score || 0,
          // Fixed: vettingStatus is a string, never render as %
          vettingStatus:    talent.vetting_status === 'Vetted' ? 'Vetted' : 'Pending',
          isVerified:       talent.is_verified     || false,
          // Fixed: scores come from verified_scores, not talents
          technicalScore:   score.technical_proficiency ?? null,
          ethicScore:       score.work_ethic            ?? null,
          supervisorNotes:  score.supervisor_comments   || 'No evaluations logged yet.',
          hasScoreRecord:   !!score.intern_id,
        };
      });

      setInterns(flattenedRecords);
    } catch (err) {
      console.error('Critical error building cohort view:', err.message);
      toast.error(`Failed to load cohort data: ${err.message}`);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => { fetchLiveCohortData(); }, []);

  // ── 2. UPDATE STATUS ─────────────────────────────────────────────────────────
  const updateInternStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('talents')
        .update({ status: newStatus })
        .eq('id', id);
      if (error) throw error;

      setInterns(prev => prev.map(item =>
        item.id === id ? { ...item, status: newStatus } : item
      ));
      if (selectedIntern?.id === id) {
        setSelectedIntern(prev => ({ ...prev, status: newStatus }));
      }
      toast.success('Pipeline status updated successfully!');
    } catch (err) {
      toast.error(`Database rejected modification: ${err.message}`);
    }
  };

  // ── 3. SAVE SCORES ───────────────────────────────────────────────────────────
  const handleSaveScores = async () => {
    if (!selectedIntern) return;
    setSavingScores(true);
    try {
      const payload = {
        intern_id:             selectedIntern.id,
        technical_proficiency: parseInt(scoreForm.technical_proficiency, 10) || 0,
        work_ethic:            parseInt(scoreForm.work_ethic, 10)            || 0,
        supervisor_comments:   scoreForm.supervisor_comments,
        updated_at:            new Date().toISOString(),
      };

      let error;
      if (selectedIntern.hasScoreRecord) {
        ({ error } = await supabase
          .from('verified_scores')
          .update(payload)
          .eq('intern_id', selectedIntern.id));
      } else {
        ({ error } = await supabase
          .from('verified_scores')
          .insert([payload]));
      }
      if (error) throw error;

      const updated = {
        ...selectedIntern,
        technicalScore:  payload.technical_proficiency,
        ethicScore:      payload.work_ethic,
        supervisorNotes: payload.supervisor_comments || 'No evaluations logged yet.',
        hasScoreRecord:  true,
      };
      setSelectedIntern(updated);
      setInterns(prev => prev.map(i => i.id === selectedIntern.id ? updated : i));
      setEditingScores(false);
      toast.success('Evaluation scores saved successfully!');
    } catch (err) {
      toast.error(`Failed to save scores: ${err.message}`);
    } finally {
      setSavingScores(false);
    }
  };

  const openScoreEditor = () => {
    setScoreForm({
      technical_proficiency: selectedIntern.technicalScore ?? '',
      work_ethic:            selectedIntern.ethicScore     ?? '',
      supervisor_comments:
        selectedIntern.supervisorNotes === 'No evaluations logged yet.'
          ? '' : selectedIntern.supervisorNotes,
    });
    setEditingScores(true);
  };

  // ── 4. LOGOUT ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Signed out successfully');
    } catch (err) {
      toast.error(`Logout failed: ${err.message}`);
    }
  };

  // ── Filters ──────────────────────────────────────────────────────────────────
  const dynamicCohorts = ['All', ...new Set(interns.map(i => i.cohort).filter(Boolean))];

  const filteredInterns = interns.filter(intern => {
    const matchesSearch =
      intern.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      intern.track.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCohort = selectedCohort === 'All' || intern.cohort === selectedCohort;
    return matchesSearch && matchesCohort;
  });

  const pipelineStages = [
    { id: 'National Pipeline',  title: 'National Pipeline'     },
    { id: 'Verification Phase', title: 'Verification Phase'    },
    { id: 'MDA Rotation',       title: 'MDA Rotation (Active)' },
    { id: 'Deployment Ready',   title: 'Deployment Ready'      },
    { id: 'Placed (Public)',    title: 'Placed (Public)'       },
    { id: 'Placed (Private)',   title: 'Placed (Private)'      },
    { id: 'Attrition/Inactive', title: 'Attrition / Inactive' },
  ];

  if (loadingData) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-3">
      <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm font-semibold text-slate-500 tracking-wide">
        Syncing live cohort metrics from Supabase...
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/60 p-6 font-sans antialiased text-slate-800">
      <Toaster position="top-right" />

      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Operations Command</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track deployment statuses, update performance indices, and dispatch cohort parameters.
          </p>
        </div>

        <div className="flex items-center gap-3 self-end lg:self-center">
          <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl border border-slate-300/40">
            <button
              onClick={() => setViewType('list')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                viewType === 'list' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" /> Cohort List View
            </button>
            <button
              onClick={() => setViewType('kanban')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                viewType === 'kanban' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" /> Rotation Kanban
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>

      {/* ── FILTERS ──────────────────────────────────────────────────────────── */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-1 min-w-70 gap-3">
          <input
            type="text"
            placeholder="Search interns by name or functional track..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-sm p-2.5 border border-slate-200 rounded-lg bg-slate-50/50 outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
          />
          <select
            value={selectedCohort}
            onChange={e => setSelectedCohort(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg p-2.5 bg-slate-50/50 outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            {dynamicCohorts.map(c => (
              <option key={c} value={c}>{c === 'All' ? 'All Cohorts' : c}</option>
            ))}
          </select>
        </div>
        <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          Showing <span className="text-slate-900 font-bold">{filteredInterns.length}</span> of {interns.length} Active Profiles
        </div>
      </div>

      {/* ── LIST VIEW ────────────────────────────────────────────────────────── */}
      {viewType === 'list' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Full Name</th>
                  <th className="p-4">ICT Specialty</th>
                  <th className="p-4">Home County</th>
                  <th className="p-4">Cohort Group</th>
                  <th className="p-4">Pipeline Status</th>
                  <th className="p-4 text-center">Tech Score</th>
                  <th className="p-4 text-center">Vetted</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredInterns.map(intern => (
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
                    <td className="p-4 text-center font-bold text-emerald-600">
                      {intern.technicalScore !== null ? `${intern.technicalScore}%` : '—'}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        intern.vettingStatus === 'Vetted'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {intern.vettingStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => { setSelectedIntern(intern); setEditingScores(false); }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-teal-600 hover:text-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition"
                      >
                        Evaluate Profile
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredInterns.length === 0 && (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-slate-400 italic">
                      No matching records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      ) : (
        /* ── KANBAN VIEW ───────────────────────────────────────────────────── */
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 items-start min-w-max px-0.5">
            {pipelineStages.map(stage => {
              const stageInterns = filteredInterns.filter(i => i.status === stage.id);
              return (
                <div key={stage.id} className="w-72 bg-slate-100/80 border border-slate-200 rounded-xl p-3 flex flex-col max-h-[70vh]">
                  <div className="flex justify-between items-center mb-3 px-1">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide truncate w-48">
                      {stage.title}
                    </h3>
                    <span className="text-xs font-bold bg-slate-200/80 px-2 py-0.5 rounded-full text-slate-600">
                      {stageInterns.length}
                    </span>
                  </div>
                  <div className="space-y-2.5 overflow-y-auto flex-1">
                    {stageInterns.map(intern => (
                      <div
                        key={intern.id}
                        onClick={() => { setSelectedIntern(intern); setEditingScores(false); }}
                        className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm hover:shadow hover:border-teal-500/40 cursor-pointer transition-all"
                      >
                        <h4 className="font-semibold text-slate-800 text-sm">{intern.name}</h4>
                        <p className="text-xs text-slate-500 mt-1">{intern.track}</p>
                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {intern.county}</span>
                          <span className="font-bold text-emerald-600">
                            {intern.technicalScore !== null ? `${intern.technicalScore}%` : 'No score'}
                          </span>
                        </div>
                      </div>
                    ))}
                    {stageInterns.length === 0 && (
                      <div className="border border-dashed border-slate-300/60 rounded-xl h-24 flex items-center justify-center text-slate-400 text-xs italic">
                        Empty Stage
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── SLIDE-OUT DETAIL MODAL ────────────────────────────────────────────── */}
      {selectedIntern && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-xl bg-white h-screen shadow-2xl flex flex-col border-l border-slate-200">

            {/* Header */}
            <div className="bg-slate-900 p-6 text-white flex justify-between items-start shrink-0">
              <div>
                <span className="text-xs font-bold text-teal-400 bg-teal-950/60 border border-teal-800 px-2 py-1 rounded-md uppercase tracking-wider">
                  {selectedIntern.cohort}
                </span>
                <h2 className="text-xl font-bold mt-2 tracking-tight">{selectedIntern.name}</h2>
                <p className="text-sm text-slate-400 mt-0.5">{selectedIntern.email}</p>
                <p className="text-xs text-slate-500 mt-1">{selectedIntern.track} · {selectedIntern.county}</p>
              </div>
              <button
                onClick={() => { setSelectedIntern(null); setEditingScores(false); }}
                className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* SCORES */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Core Score Performance Metric
                  </h3>
                  {!editingScores ? (
                    <button
                      onClick={openScoreEditor}
                      className="flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-lg transition-all"
                    >
                      <Edit3 className="w-3 h-3" />
                      {selectedIntern.hasScoreRecord ? 'Edit Scores' : 'Add Scores'}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingScores(false)}
                        className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-700 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-all"
                      >
                        <XCircle className="w-3 h-3" /> Cancel
                      </button>
                      <button
                        onClick={handleSaveScores}
                        disabled={savingScores}
                        className="flex items-center gap-1 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-all"
                      >
                        <Save className="w-3 h-3" />
                        {savingScores ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  )}
                </div>

                {editingScores ? (
                  <div className="space-y-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                          Technical Proficiency (0–100)
                        </label>
                        <input
                          type="number" min="0" max="100"
                          value={scoreForm.technical_proficiency}
                          onChange={e => setScoreForm({ ...scoreForm, technical_proficiency: e.target.value })}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-teal-700 focus:border-teal-500 outline-none"
                          placeholder="e.g. 85"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                          Work Ethic (0–100)
                        </label>
                        <input
                          type="number" min="0" max="100"
                          value={scoreForm.work_ethic}
                          onChange={e => setScoreForm({ ...scoreForm, work_ethic: e.target.value })}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-indigo-700 focus:border-teal-500 outline-none"
                          placeholder="e.g. 90"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                        Supervisor Comments
                      </label>
                      <textarea
                        rows={3}
                        value={scoreForm.supervisor_comments}
                        onChange={e => setScoreForm({ ...scoreForm, supervisor_comments: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:border-teal-500 outline-none resize-none"
                        placeholder="e.g. Demonstrated excellent initiative on full-stack project..."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl">
                        <span className="text-xs text-slate-500 font-medium">Technical Proficiency</span>
                        <div className="text-2xl font-bold text-teal-600 mt-1">
                          {selectedIntern.technicalScore !== null ? `${selectedIntern.technicalScore}%` : '—'}
                        </div>
                        {selectedIntern.technicalScore !== null && (
                          <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full bg-teal-500"
                              style={{ width: `${selectedIntern.technicalScore}%` }} />
                          </div>
                        )}
                      </div>
                      <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl">
                        <span className="text-xs text-slate-500 font-medium">Work Ethic & Delivery</span>
                        <div className="text-2xl font-bold text-indigo-600 mt-1">
                          {selectedIntern.ethicScore !== null ? `${selectedIntern.ethicScore}%` : '—'}
                        </div>
                        {selectedIntern.ethicScore !== null && (
                          <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full bg-indigo-500"
                              style={{ width: `${selectedIntern.ethicScore}%` }} />
                          </div>
                        )}
                      </div>
                    </div>

                    {!selectedIntern.hasScoreRecord && (
                      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 font-medium">
                        <Award className="w-4 h-4 shrink-0" />
                        No evaluation submitted yet. Click "Add Scores" to record supervisor feedback.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* GEOGRAPHIC */}
              <div className="border-t border-slate-100 pt-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Geographic & Core Classification
                </h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                  {[
                    { label: 'Assigned Specialty Track', value: selectedIntern.track           },
                    { label: 'Home County Origin',        value: selectedIntern.county          },
                    { label: 'MDA / Organization',        value: selectedIntern.company         },
                    { label: 'Vetting Status',            value: selectedIntern.vettingStatus,
                      color: selectedIntern.vettingStatus === 'Vetted' ? 'text-emerald-600' : 'text-slate-500' },
                    { label: 'Suitability Score',         value: `${selectedIntern.suitabilityScore}%` },
                    { label: 'Identity Verified',         value: selectedIntern.isVerified ? 'Yes' : 'No',
                      color: selectedIntern.isVerified ? 'text-emerald-600' : 'text-slate-500' },
                  ].map(item => (
                    <div key={item.label}>
                      <span className="text-xs text-slate-400 block">{item.label}</span>
                      <span className={`font-semibold ${item.color || 'text-slate-800'}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SUPERVISOR NOTES */}
              <div className="border-t border-slate-100 pt-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Field Supervisor Evaluation Notes
                </h3>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm italic text-slate-600 leading-relaxed">
                  "{selectedIntern.supervisorNotes}"
                </div>
              </div>

              {/* PIPELINE ACTIONS */}
              <div className="border-t border-slate-100 pt-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Execute Strategic Pipeline Allocations
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { status: 'MDA Rotation',       label: 'Assign to Active MDA Rotation',   Icon: RefreshCw,     dark: false },
                    { status: 'Verification Phase', label: 'Initiate Interview Verification',  Icon: ShieldCheck,   dark: false },
                    { status: 'Deployment Ready',   label: 'Add to Cabinet Fast-Track Pool',   Icon: Zap,           dark: false },
                    { status: 'Placed (Public)',     label: 'Finalize Public Sector Placement', Icon: GraduationCap, dark: true  },
                  ].map(action => {
                    const isActive = selectedIntern.status === action.status;
                    return (
                      <button
                        key={action.status}
                        onClick={() => updateInternStatus(selectedIntern.id, action.status)}
                        className={`p-2.5 text-xs text-left font-bold rounded-lg border transition flex items-center justify-between ${
                          isActive
                            ? 'bg-teal-50 border-teal-200 text-teal-700'
                            : action.dark
                            ? 'bg-teal-600 border-teal-700 text-white hover:bg-teal-700'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <action.Icon className="w-3.5 h-3.5" /> {action.label}
                        </span>
                        <span>{isActive ? '✓' : '→'}</span>
                      </button>
                    );
                  })}
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
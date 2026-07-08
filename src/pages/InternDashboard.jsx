import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import {
  Award, Clock, CheckCircle2, UserPlus, Sparkles, Building, MapPin,
  GraduationCap, LogOut, TrendingUp, Zap, Users, Bell, Briefcase,
  FileText, Home, User, ChevronRight, Upload, Plus, X,
  Shield, BarChart2, BookOpen, AlertCircle
} from 'lucide-react';

// ─── Profile Strength Calculator ──────────────────────────────────────────────
const calcProfileStrength = (profile, skills, documents, profileDetails) => {
  const sections = [
    { name: 'Personal Info',     done: !!(profile?.name && profile?.email) },
    { name: 'County',            done: !!profile?.county },
    { name: 'ICT Track',         done: !!profile?.position },
    { name: 'Skills',            done: skills.length > 0 },
    { name: 'Documents',         done: documents.length > 0 },
    { name: 'Education',         done: !!(profileDetails?.education || profileDetails?.field_of_study) },
    { name: 'Motivation Letter', done: !!profileDetails?.motivation_letter },
  ];
  const completed = sections.filter(s => s.done).length;
  return {
    percentage: Math.round((completed / sections.length) * 100),
    completed,
    total: sections.length,
    sections,
  };
};

// ─── Sidebar Nav Item ──────────────────────────────────────────────────────────
const NavItem = ({ icon: Icon, label, sublabel, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all group ${
      active
        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <div className={`p-1.5 rounded-lg ${active ? 'bg-emerald-500/20' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
      <Icon className="w-4 h-4" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold truncate">{label}</p>
      {sublabel && <p className="text-[10px] text-slate-500 truncate">{sublabel}</p>}
    </div>
    {badge > 0 && (
      <span className="bg-emerald-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
        {badge}
      </span>
    )}
  </button>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, color }) => {
  const colors = {
    emerald: 'text-emerald-400',
    purple:  'text-purple-400',
    blue:    'text-blue-400',
    orange:  'text-orange-400',
  };
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{label}</p>
      <p className={`text-3xl font-black ${colors[color] || 'text-white'}`}>{value}</p>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const InternDashboard = ({ talentId }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile]     = useState(null);
  const [scores, setScores]       = useState(null);
  const [skills, setSkills]       = useState([]);
  const [documents, setDocuments] = useState([]);
  const [applications, setApplications]         = useState([]);
  const [recommendedJobs, setRecommendedJobs]   = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [notifications, setNotifications]       = useState([]);
  const [cohortStats, setCohortStats] = useState({ total: 0, hired: 0, inInterviews: 0 });
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Profile details (extended fields) + edit state
  const [profileDetails, setProfileDetails] = useState({});
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});

  // Modal states
  const [showAppModal,       setShowAppModal]       = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showProfileModal,   setShowProfileModal]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '', position: '', county: '', cohort: 'Cohort 2024/2025', skills: ''
  });
  const [newAppForm, setNewAppForm] = useState({ company: '', position: '', status: 'Backlog' });
  const [newInterviewForm, setNewInterviewForm] = useState({
    company: '', position: '', date: '', time: '', type: 'Technical', mode: 'Remote (Google Meet)'
  });

  // ── Data Fetching ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      if (!talentId) return;
      try {
        const { data: talentData } = await supabase
          .from('talents').select('*').eq('id', talentId).maybeSingle();

        if (talentData) {
          setProfile(talentData);

          const [scoreRes, skillsRes, appsRes, jobsRes, interviewRes, docsRes, notifRes] =
            await Promise.all([
              supabase.from('verified_scores').select('*').eq('intern_id', talentId).maybeSingle(),
              supabase.from('talent_skills').select('skill_name').eq('talent_id', talentData.id),
              supabase.from('applications').select('*').eq('intern_id', talentId),
              supabase.from('jobs').select('*').limit(4),
              supabase.from('interviews').select('*').eq('intern_id', talentId).order('interview_date', { ascending: true }),
              supabase.from('documents').select('*').eq('talent_id', talentId),
              supabase.from('notifications').select('*').eq('talent_id', talentId).order('created_at', { ascending: false }),
            ]);

          if (scoreRes.data)     setScores(scoreRes.data);
          if (skillsRes.data)    setSkills(skillsRes.data);
          if (appsRes.data)      setApplications(appsRes.data);
          if (docsRes.data)      setDocuments(docsRes.data);
          if (notifRes.data)     setNotifications(notifRes.data);

          if (jobsRes.data) {
            setRecommendedJobs(jobsRes.data.map((job, i) => ({
              id: job.id, title: job.title, company: job.company,
              location: job.location, type: job.type,
              salary: job.salary || 'Negotiable',
              match: i === 0 ? 92 : i === 1 ? 85 : 78,
              skills: job.tags || [], url: job.url
            })));
          }

          if (interviewRes.data) {
            setUpcomingInterviews(interviewRes.data.map(int => {
              const d = new Date(int.interview_date);
              return {
                id: int.id, company: int.company, position: int.position,
                date: d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }).toUpperCase(),
                time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                type: int.type, mode: int.mode
              };
            }));
          }

          // Fetch extended profile fields
          const { data: profData } = await supabase
            .from('profiles')
            .select('education, field_of_study, motivation_letter, work_locations')
            .eq('id', talentId)
            .maybeSingle();

          if (profData) setProfileDetails(profData);
          // Fetch live cohort stats
          const { data: cohortData } = await supabase
            .from('talents')
            .select('status')
            .eq('cohort', talentData.cohort);

          if (cohortData) {
            setCohortStats({
              total: cohortData.length,
              hired: cohortData.filter(t =>
                t.status === 'Placed (Public)' ||
                t.status === 'Placed (Private)'
              ).length,
              inInterviews: cohortData.filter(t =>
                t.status === 'Verification Phase'
              ).length,
            });
          }
        } else {
          // Check pending invite for pre-fill
          const { data: authData } = await supabase.auth.getUser();
          if (authData?.user?.email) {
            const { data: invite } = await supabase
              .from('pending_invites').select('*')
              .eq('email', authData.user.email).maybeSingle();
            if (invite) {
              setFormData({
                name: invite.name || '',
                position: invite.position || '',
                county: invite.county || '',
                cohort: invite.cohort || 'Cohort 2024/2025',
                skills: invite.skills ? invite.skills.join(', ') : ''
              });
            }
          }
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [talentId]);

  // ── Derived Stats ────────────────────────────────────────────────────────────
  const pipelineStats = useMemo(() => ({
    backlog:   applications.filter(a => a.status === 'Backlog').length,
    tailoring: applications.filter(a => a.status === 'Tailoring').length,
    inPlay:    applications.filter(a => a.status === 'In-Play').length,
    hired:     applications.filter(a => a.status === 'Hired').length,
  }), [applications]);

  const profileStrength = useMemo(
    () => calcProfileStrength(profile, skills, documents, profileDetails),
    [profile, skills, documents, profileDetails]
  );

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const daysRegistered = profile?.created_at
    ? Math.floor((Date.now() - new Date(profile.created_at)) / 86400000)
    : 0;

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleLogout = async () => { await supabase.auth.signOut(); window.location.reload(); };

  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data: talent, error } = await supabase
        .from('talents')
        .insert([{ id: talentId, name: formData.name, position: formData.position,
          county: formData.county, cohort: formData.cohort, status: 'National Pipeline',
          profile_id: talentId, vetting_status: 'Pending',
          is_verified: false,
          suitability_score: 0,
          company: 'Unassigned' }])
        .select().single();
      if (error) throw error;

      if (formData.skills) {
        const skillList = formData.skills.split(',')
          .map(s => s.trim()).filter(Boolean)
          .map(skill => ({ talent_id: talent.id, skill_name: skill }));
        await supabase.from('talent_skills').insert(skillList);
      }

      // Clean up pending invite
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user?.email) {
        await supabase.from('pending_invites').delete().eq('email', authData.user.email);
      }

      setProfile(talent);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddApplication = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('applications')
        .insert([{ intern_id: talentId, company: newAppForm.company,
          position: newAppForm.position, status: newAppForm.status }])
        .select().single();
      if (error) throw error;
      setApplications(prev => [...prev, data]);
      setShowAppModal(false);
      setNewAppForm({ company: '', position: '', status: 'Backlog' });
    } catch (err) { alert('Error: ' + err.message); }
  };

  const handleAddInterview = async (e) => {
    e.preventDefault();
    try {
      const combinedDateTime = new Date(`${newInterviewForm.date}T${newInterviewForm.time}`).toISOString();
      const { data, error } = await supabase
        .from('interviews')
        .insert([{ intern_id: talentId, company: newInterviewForm.company,
          position: newInterviewForm.position, interview_date: combinedDateTime,
          type: newInterviewForm.type, mode: newInterviewForm.mode }])
        .select().single();
      if (error) throw error;
      const d = new Date(data.interview_date);
      setUpcomingInterviews(prev => [...prev, {
        id: data.id, company: data.company, position: data.position,
        date: d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }).toUpperCase(),
        time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        type: data.type, mode: data.mode
      }]);
      setShowInterviewModal(false);
      setNewInterviewForm({ company: '', position: '', date: '', time: '', type: 'Technical', mode: 'Remote (Google Meet)' });
    } catch (err) { alert('Error: ' + err.message); }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let finalResumeUrl = profile.resume_url;
      if (resumeFile) {
        const fileExt = resumeFile.name.split('.').pop();
        const fileName = `${talentId}-${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('resumes').upload(fileName, resumeFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('resumes').getPublicUrl(fileName);
        finalResumeUrl = publicUrl;

        // Also log in documents table
        await supabase.from('documents').insert([{
          talent_id: talentId, name: resumeFile.name, url: finalResumeUrl, type: 'CV'
        }]);
      }
      const { error } = await supabase.from('talents')
        .update({ resume_url: finalResumeUrl }).eq('id', talentId);
      if (error) throw error;
      setProfile(prev => ({ ...prev, resume_url: finalResumeUrl }));
      setShowProfileModal(false);
    } catch (err) { alert('Error: ' + err.message); }
    finally { setUploading(false); }
  };

  const handleSaveProfile = async () => {
    try {
      // Update talents table (name, position, county, cohort)
      const { error: talentErr } = await supabase
        .from('talents')
        .update({
          name:     profileForm.name,
          position: profileForm.position,
          county:   profileForm.county,
          cohort:   profileForm.cohort,
        })
        .eq('id', talentId);
      if (talentErr) throw talentErr;

      // Upsert profiles table (education, field_of_study, motivation_letter).
      // Using upsert instead of update because a profiles row may not exist yet
      // for this user — a plain .update() would silently match 0 rows and do
      // nothing in that case, which is why edits weren't persisting.
      const { error: profErr } = await supabase
        .from('profiles')
        .upsert({
          id:                talentId,
          education:         profileForm.education,
          field_of_study:    profileForm.field_of_study,
          motivation_letter: profileForm.motivation_letter,
        }, { onConflict: 'id' });
      if (profErr) throw profErr;

      // Update local state so strength bar recalculates immediately
      setProfile(prev => ({
        ...prev,
        name:     profileForm.name,
        position: profileForm.position,
        county:   profileForm.county,
        cohort:   profileForm.cohort,
      }));
      setProfileDetails({
        education:         profileForm.education,
        field_of_study:    profileForm.field_of_study,
        motivation_letter: profileForm.motivation_letter,
      });
      setEditingProfile(false);
    } catch (err) {
      alert('Error saving: ' + err.message);
    }
  };

  const markAllRead = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('talent_id', talentId);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-medium text-sm">Loading your portal...</p>
      </div>
    </div>
  );

  // ── Onboarding ───────────────────────────────────────────────────────────────
  if (!profile) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full mb-4">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">ICT Talent Pipeline</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Complete Your Profile</h1>
          <p className="text-slate-400 text-sm">Set up your intern portal to access the full dashboard.</p>
        </div>

        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
          <form onSubmit={handleOnboardingSubmit} className="p-8 space-y-5">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                <UserPlus className="w-3 h-3" /> Full Name
              </label>
              <input required type="text" placeholder="e.g. John Doe" value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:border-emerald-500 transition-all text-sm placeholder:text-slate-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  <Building className="w-3 h-3" /> ICT Track
                </label>
                <input required type="text" placeholder="e.g. Software Engineer" value={formData.position}
                  onChange={e => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:border-emerald-500 transition-all text-sm placeholder:text-slate-600"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  <MapPin className="w-3 h-3" /> County
                </label>
                <input required type="text" placeholder="e.g. Nairobi" value={formData.county}
                  onChange={e => setFormData({ ...formData, county: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:border-emerald-500 transition-all text-sm placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                <GraduationCap className="w-3 h-3" /> Cohort
              </label>
              <select value={formData.cohort} onChange={e => setFormData({ ...formData, cohort: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:border-emerald-500 transition-all text-sm cursor-pointer">
                <option value="Cohort 2025/2026">Cohort 2025/26</option>
                <option value="Cohort 2024/2025">Cohort 2024/25</option>
                <option value="Cohort 2023/2024">Cohort 2023/24</option>
                <option value="Cohort 2022/2023">Cohort 2022/23</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                <Sparkles className="w-3 h-3" /> Skills (comma separated)
              </label>
              <input type="text" placeholder="e.g. React, Python, SQL" value={formData.skills}
                onChange={e => setFormData({ ...formData, skills: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:border-emerald-500 transition-all text-sm placeholder:text-slate-600"
              />
            </div>

            <button type="submit" disabled={submitting}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-900 font-black rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-2">
              {submitting ? 'Setting up your portal...' : 'Enter the Pipeline →'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-4">
          Already registered?{' '}
          <button onClick={handleLogout} className="text-slate-400 underline hover:text-white">Sign out</button>
        </p>
      </div>
    </div>
  );

  // ── Tab Content ───────────────────────────────────────────────────────────────
  const tabs = {

    // ── DASHBOARD TAB ──────────────────────────────────────────────────────────
    dashboard: (
      <div className="space-y-6">
        {/* Hero card */}
        <div className="bg-linear-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                  {profile.cohort}
                </span>
                <h2 className="text-3xl font-black text-white mt-3">
                  Welcome back, <span className="text-emerald-400">{profile.name?.split(' ')[0]}</span>
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  {profile.position} · {profile.county} County
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black text-white">{profileStrength.percentage}%</p>
                <p className="text-xs text-slate-400 font-bold">Profile complete</p>
              </div>
            </div>

            {/* Profile strength bar */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                <span>Profile strength</span>
                <span>{profileStrength.completed}/{profileStrength.total} sections</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-linear-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
                  style={{ width: `${profileStrength.percentage}%` }}
                />
              </div>
              {profileStrength.percentage < 100 && (
                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Complete your profile to unlock all placement opportunities
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Profile Strength"  value={`${profileStrength.percentage}%`} color="emerald" />
          <StatCard label="Skills Added"      value={skills.length}                    color="purple"  />
          <StatCard label="Documents"         value={`${documents.length}/0`}          color="blue"    />
          <StatCard label="Days Registered"   value={daysRegistered}                   color="orange"  />
        </div>

        {/* Pipeline + Next Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pipeline stats */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest mb-5 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" /> Application Pipeline
            </h3>
            <div className="grid grid-cols-4 gap-3 mb-5">
              {[
                { label: 'Backlog',   value: pipelineStats.backlog,   color: 'bg-slate-800 border-slate-700 text-slate-300' },
                { label: 'Tailoring', value: pipelineStats.tailoring, color: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' },
                { label: 'In-Play',   value: pipelineStats.inPlay,    color: 'bg-purple-500/10 border-purple-500/20 text-purple-400' },
                { label: 'Hired',     value: pipelineStats.hired,     color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
              ].map(s => (
                <div key={s.label} className={`text-center p-4 rounded-xl border ${s.color}`}>
                  <p className="text-2xl font-black">{s.value}</p>
                  <p className="text-[10px] font-bold mt-1 opacity-70">{s.label}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setShowAppModal(true)}
              className="w-full py-2.5 border border-dashed border-slate-700 text-slate-500 hover:border-emerald-500/50 hover:text-emerald-400 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Log New Application
            </button>
          </div>

          {/* Next steps */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest mb-5">Next Steps</h3>
            <div className="space-y-3">
              {profileStrength.sections.map(s => (
                <div key={s.name} className="flex items-center gap-3">
                  {s.done
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    : <div className="w-4 h-4 rounded-full border-2 border-slate-600 shrink-0" />}
                  <span className={`text-sm font-medium ${s.done ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                    {s.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pipeline status */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-orange-400" /> Placement Status
          </h3>
          <div className="flex items-center gap-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
            <div>
              <p className="font-bold text-orange-300 text-sm">{profile.status}</p>
              <p className="text-xs text-slate-500 mt-0.5">Live pipeline — managed by ICT Authority admin</p>
            </div>
          </div>
        </div>

        {/* Cohort Stats */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" /> Cohort Overview
            <span className="text-slate-600 font-medium normal-case tracking-normal text-xs">
            ({profile.cohort})
            </span>
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-white">{cohortStats.total}</p>
              <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">Total Interns</p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-emerald-400">{cohortStats.hired}</p>
              <p className="text-[10px] font-bold text-emerald-600 mt-1 uppercase tracking-wider">Placed</p>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-purple-400">{cohortStats.inInterviews}</p>
              <p className="text-[10px] font-bold text-purple-600 mt-1 uppercase tracking-wider">In Verification</p>
            </div>
          </div>
        </div>
      </div>
    ),

    // ── PROFILE TAB ────────────────────────────────────────────────────────────
    profile: (
      <div className="space-y-6">
        {/* Profile Builder checklist — unchanged */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" /> Profile Builder
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profileStrength.sections.map(s => (
              <div key={s.name}
                className={`flex items-center justify-between p-4 rounded-xl border ${
                  s.done ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-800/50 border-slate-700'
                }`}>
                <div className="flex items-center gap-3">
                  {s.done
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    : <div className="w-5 h-5 rounded-full border-2 border-slate-600" />}
                  <span className={`text-sm font-bold ${s.done ? 'text-emerald-300' : 'text-slate-300'}`}>
                    {s.name}
                  </span>
                </div>
                <span className={`text-xs font-black ${s.done ? 'text-emerald-400' : 'text-slate-600'}`}>
                  {s.done ? '100%' : '0%'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Editable Personal Info */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" /> Personal Info
            </h3>
            {!editingProfile ? (
              <button
                onClick={() => {
                  setProfileForm({
                    name:              profile.name || '',
                    position:          profile.position || '',
                    county:            profile.county || '',
                    cohort:            profile.cohort || '',
                    education:         profileDetails.education || '',
                    field_of_study:    profileDetails.field_of_study || '',
                    motivation_letter: profileDetails.motivation_letter || '',
                  });
                  setEditingProfile(true);
                }}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 border border-blue-500/20 hover:border-blue-500/40 px-3 py-1.5 rounded-lg transition-all">
                Edit Profile →
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setEditingProfile(false)}
                  className="text-xs font-bold text-slate-400 border border-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-all">
                  Cancel
                </button>
                <button onClick={handleSaveProfile}
                  className="text-xs font-bold text-slate-900 bg-emerald-500 hover:bg-emerald-400 px-4 py-1.5 rounded-lg transition-all">
                  Save Changes
                </button>
              </div>
            )}
          </div>

          {editingProfile ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Full Name',        key: 'name',           placeholder: 'e.g. John Doe' },
                { label: 'ICT Track',        key: 'position',       placeholder: 'e.g. Software Engineer' },
                { label: 'County',           key: 'county',         placeholder: 'e.g. Nairobi' },
                { label: 'Education',        key: 'education',      placeholder: 'e.g. BSc Computer Science' },
                { label: 'Field of Study',   key: 'field_of_study', placeholder: 'e.g. Information Technology' },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">{field.label}</label>
                  <input
                    type="text"
                    value={profileForm[field.key] || ''}
                    placeholder={field.placeholder}
                    onChange={e => setProfileForm({ ...profileForm, [field.key]: e.target.value })}
                    className="w-full mt-1.5 p-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:border-emerald-500 outline-none text-sm placeholder:text-slate-600 transition-all"
                  />
                </div>
              ))}

              {/* Cohort — dropdown */}
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Cohort</label>
                <select value={profileForm.cohort || ''}
                  onChange={e => setProfileForm({ ...profileForm, cohort: e.target.value })}
                  className="w-full mt-1.5 p-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:border-emerald-500 outline-none text-sm cursor-pointer">
                  <option value="Cohort 2025/2026">Cohort 2025/2026</option>
                  <option value="Cohort 2024/2025">Cohort 2024/2025</option>
                  <option value="Cohort 2023/2024">Cohort 2023/2024</option>
                  <option value="Cohort 2022/2023">Cohort 2022/2023</option>
                </select>
              </div>

              {/* Motivation letter — full width */}
              <div className="col-span-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Motivation Letter</label>
                <textarea
                  rows={4}
                  value={profileForm.motivation_letter || ''}
                  placeholder="Write a brief motivation statement for your placement..."
                  onChange={e => setProfileForm({ ...profileForm, motivation_letter: e.target.value })}
                  className="w-full mt-1.5 p-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:border-emerald-500 outline-none text-sm placeholder:text-slate-600 resize-none transition-all"
                />
              </div>
            </div>
          ) : (
            /* Read-only view */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Full Name',       value: profile.name },
                { label: 'ICT Track',       value: profile.position },
                { label: 'County',          value: profile.county },
                { label: 'Cohort',          value: profile.cohort },
                { label: 'Education',       value: profileDetails.education },
                { label: 'Field of Study',  value: profileDetails.field_of_study },
              ].map(item => (
                <div key={item.label} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">{item.label}</p>
                  <p className={`text-sm font-bold ${item.value ? 'text-white' : 'text-slate-600 italic'}`}>
                    {item.value || 'Not set'}
                  </p>
                </div>
              ))}
              {profileDetails.motivation_letter && (
                <div className="col-span-2 p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-wider mb-2">Motivation Letter</p>
                  <p className="text-sm text-slate-300 leading-relaxed">{profileDetails.motivation_letter}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Skills */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" /> Technical Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {skills.length > 0 ? skills.map((s, i) => (
              <span key={i}
                className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-full text-xs font-bold">
                {s.skill_name}
              </span>
            )) : (
              <p className="text-slate-500 text-sm italic">No skills added yet — complete onboarding to add skills.</p>
            )}
          </div>
        </div>

        {/* Verified Scores */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" /> Verified Scores
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">Technical Proficiency</p>
              <p className="text-4xl font-black text-white">{scores?.technical_proficiency ?? 'N/A'}</p>
              {scores?.technical_proficiency && (
                <div className="mt-3 w-full bg-slate-700 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-emerald-400"
                    style={{ width: `${scores.technical_proficiency}%` }} />
                </div>
              )}
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">Work Ethic</p>
              <p className="text-4xl font-black text-white">{scores?.work_ethic ?? 'N/A'}</p>
              {scores?.work_ethic && (
                <div className="mt-3 w-full bg-slate-700 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-blue-400"
                    style={{ width: `${scores.work_ethic}%` }} />
                </div>
              )}
            </div>
          </div>
          {scores?.supervisor_comments && (
            <div className="mt-4 p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
              <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Supervisor Comments</p>
              <p className="text-slate-300 text-sm italic">"{scores.supervisor_comments}"</p>
            </div>
          )}
        </div>
      </div>
    ),

    // ── DOCUMENTS TAB ──────────────────────────────────────────────────────────
    documents: (
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" /> My Documents
            </h3>
            <button onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 rounded-xl text-xs font-bold transition-all">
              <Upload className="w-3.5 h-3.5" /> Upload Document
            </button>
          </div>

          {documents.length > 0 ? (
            <div className="space-y-3">
              {documents.map(doc => (
                <div key={doc.id}
                  className="flex items-center justify-between p-4 bg-slate-800 border border-slate-700 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <FileText className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{doc.name}</p>
                      <p className="text-[10px] text-slate-500">{doc.type} · {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <a href={doc.url} target="_blank" rel="noreferrer"
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">
                    View →
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-slate-700 rounded-xl">
              <FileText className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-bold text-sm">No documents uploaded yet</p>
              <p className="text-slate-600 text-xs mt-1">Upload your CV, certificates, or national ID</p>
              <button onClick={() => setShowProfileModal(true)}
                className="mt-4 px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl text-xs font-bold hover:bg-blue-500/20 transition-all">
                Upload your first document
              </button>
            </div>
          )}
        </div>

        {profile?.resume_url && (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-sm font-bold text-emerald-300">Resume on file</p>
                <p className="text-xs text-slate-500">Your resume is visible to the admin team</p>
              </div>
            </div>
            <a href={profile.resume_url} target="_blank" rel="noreferrer"
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300">
              View →
            </a>
          </div>
        )}
      </div>
    ),

    // ── JOBS TAB ───────────────────────────────────────────────────────────────
    jobs: (
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest mb-5 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" /> Recommended For You
          </h3>
          {recommendedJobs.length > 0 ? (
            <div className="space-y-4">
              {recommendedJobs.map(job => (
                <div key={job.id}
                  className="p-5 bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl transition-all group">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{job.title}</h4>
                      <p className="text-sm text-slate-400">{job.company}</p>
                    </div>
                    <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-black">
                      {job.match}% match
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    📍 {job.location} · {job.type} · 💰 {job.salary}
                  </p>
                  {job.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {job.skills.map((skill, i) => (
                        <span key={i} className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setShowAppModal(true)}
                      className="flex-1 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-xs font-bold transition-all">
                      Log Application
                    </button>
                    {job.url && (
                      <a href={job.url} target="_blank" rel="noreferrer"
                        className="flex-1 py-2 bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600 rounded-lg text-xs font-bold text-center transition-all">
                        View Listing →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm italic text-center py-8">No job recommendations yet — check back soon.</p>
          )}
        </div>

        {/* Upcoming Interviews */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-400" /> Upcoming Interviews
            </h3>
            <button onClick={() => setShowInterviewModal(true)}
              className="text-xs font-bold text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1">
              <Plus className="w-3 h-3" /> Log Interview
            </button>
          </div>
          {upcomingInterviews.length > 0 ? (
            <div className="space-y-3">
              {upcomingInterviews.map(iv => (
                <div key={iv.id} className="flex items-center gap-4 p-4 bg-red-500/5 border border-red-500/15 rounded-xl">
                  <div className="text-center min-w-12 border-r border-red-500/20 pr-4">
                    <p className="text-2xl font-black text-red-400">{iv.date.split(' ')[0]}</p>
                    <p className="text-[10px] text-red-500 font-bold">{iv.date.split(' ')[1]}</p>
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{iv.type} · {iv.company}</p>
                    <p className="text-xs text-slate-400">{iv.position}</p>
                    <p className="text-xs text-slate-500 mt-1">{iv.mode} · {iv.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm italic text-center py-8">No interviews scheduled yet.</p>
          )}
        </div>
      </div>
    ),

    // ── NOTIFICATIONS TAB ──────────────────────────────────────────────────────
    notifications: (
      <div className="space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-400" /> Notifications
            </h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead}
                className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
                Mark all read
              </button>
            )}
          </div>
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map(n => (
                <div key={n.id}
                  className={`p-4 rounded-xl border transition-all ${
                    n.is_read
                      ? 'bg-slate-800/40 border-slate-800 opacity-60'
                      : 'bg-blue-500/5 border-blue-500/20'
                  }`}>
                  <div className="flex items-start gap-3">
                    {!n.is_read && <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 shrink-0" />}
                    <div>
                      <p className={`text-sm font-medium ${n.is_read ? 'text-slate-500' : 'text-slate-200'}`}>
                        {n.message}
                      </p>
                      <p className="text-[10px] text-slate-600 mt-1">
                        {new Date(n.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell className="w-8 h-8 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 font-bold text-sm">No notifications yet</p>
              <p className="text-slate-600 text-xs mt-1">You'll see updates from the admin team here</p>
            </div>
          )}
        </div>
      </div>
    ),
  };

  // ── Main Shell ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 flex">

      {/* SIDEBAR */}
      <aside className="w-64 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col p-4 sticky top-0 h-screen">
        {/* Logo */}
        <div className="mb-8 px-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-slate-900" />
            </div>
            <span className="font-black text-white text-sm">DevTrack</span>
          </div>
          <p className="text-[10px] text-slate-600 font-medium pl-9">ICT Talent Pipeline</p>
        </div>

        {/* Label */}
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-2 mb-2">
          Candidate Menu
        </p>

        {/* Nav */}
        <nav className="space-y-1 flex-1">
          <NavItem icon={Home}      label="Dashboard"      sublabel="Your career command center" active={activeTab === 'dashboard'}     onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={User}      label="My Profile"     sublabel="Showcase your potential"     active={activeTab === 'profile'}       onClick={() => setActiveTab('profile')} />
          <NavItem icon={FileText}  label="Documents"      sublabel="Manage your credentials"     active={activeTab === 'documents'}     onClick={() => setActiveTab('documents')} />
          <NavItem icon={Briefcase} label="Jobs"           sublabel="Opportunities & interviews"  active={activeTab === 'jobs'}          onClick={() => setActiveTab('jobs')} />
          <NavItem icon={Bell}      label="Notifications"  sublabel="Updates from admin"          active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} badge={unreadCount} />
        </nav>

        {/* Profile snapshot */}
        <div className="border-t border-slate-800 pt-4 mt-4">
          <div className="px-2 mb-3">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">Profile Snapshot</p>
            <div className="space-y-2 text-xs">
              {[
                { label: 'County',  value: profile.county    || 'Not set' },
                { label: 'Track',   value: profile.position  || 'Not set' },
                { label: 'Cohort',  value: profile.cohort    || 'Not set' },
                { label: 'Skills',  value: `${skills.length} added` },
                { label: 'Status',  value: profile.status    || 'Pipeline' },
              ].map(item => (
                <div key={item.label} className="flex justify-between">
                  <span className="text-slate-600 font-medium">{item.label}</span>
                  <span className={`font-bold truncate max-w-24 ${item.value === 'Not set' ? 'text-slate-700' : 'text-slate-300'}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* User + signout */}
          <div className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-800 transition-all cursor-pointer group"
            onClick={handleLogout}>
            <div className="w-8 h-8 bg-emerald-500/20 border border-emerald-500/30 rounded-lg flex items-center justify-center text-emerald-400 font-black text-xs shrink-0">
              {profile.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-300 truncate">{profile.name}</p>
              <p className="text-[10px] text-slate-600">Candidate</p>
            </div>
            <LogOut className="w-3.5 h-3.5 text-slate-600 group-hover:text-red-400 transition-colors" />
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 min-w-0 p-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">NextGen Workspace</p>
            <h1 className="text-2xl font-black text-white capitalize">{activeTab}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowInterviewModal(true)}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 hover:border-slate-500 rounded-xl text-xs font-bold transition-all">
              <Clock className="w-3.5 h-3.5" /> Log Interview
            </button>
            <button onClick={() => setShowAppModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-xl text-xs font-black transition-all shadow-lg shadow-emerald-500/20">
              <Plus className="w-3.5 h-3.5" /> New Application
            </button>
          </div>
        </div>

        {/* Tab content */}
        {tabs[activeTab]}
      </main>

      {/* ── MODALS ─────────────────────────────────────────────────────────────── */}

      {/* Add Application */}
      {showAppModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-white">Log Application</h2>
              <button onClick={() => setShowAppModal(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddApplication} className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Company</label>
                <input required type="text" value={newAppForm.company} placeholder="e.g. Safaricom"
                  onChange={e => setNewAppForm({ ...newAppForm, company: e.target.value })}
                  className="w-full mt-1.5 p-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:border-emerald-500 outline-none text-sm placeholder:text-slate-600" />
              </div>
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Position</label>
                <input required type="text" value={newAppForm.position} placeholder="e.g. Frontend Developer"
                  onChange={e => setNewAppForm({ ...newAppForm, position: e.target.value })}
                  className="w-full mt-1.5 p-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:border-emerald-500 outline-none text-sm placeholder:text-slate-600" />
              </div>
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Status</label>
                <select value={newAppForm.status} onChange={e => setNewAppForm({ ...newAppForm, status: e.target.value })}
                  className="w-full mt-1.5 p-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:border-emerald-500 outline-none text-sm cursor-pointer">
                  <option value="Backlog">Backlog</option>
                  <option value="Tailoring">Tailoring</option>
                  <option value="In-Play">In-Play</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAppModal(false)}
                  className="flex-1 py-3 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl font-bold hover:bg-slate-700 transition-all text-sm">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-xl font-black transition-all text-sm">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Interview */}
      {showInterviewModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-white">Log Interview</h2>
              <button onClick={() => setShowInterviewModal(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddInterview} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Company</label>
                  <input required type="text" value={newInterviewForm.company} placeholder="Safaricom"
                    onChange={e => setNewInterviewForm({ ...newInterviewForm, company: e.target.value })}
                    className="w-full mt-1.5 p-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:border-emerald-500 outline-none text-sm placeholder:text-slate-600" />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Position</label>
                  <input required type="text" value={newInterviewForm.position} placeholder="Developer"
                    onChange={e => setNewInterviewForm({ ...newInterviewForm, position: e.target.value })}
                    className="w-full mt-1.5 p-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:border-emerald-500 outline-none text-sm placeholder:text-slate-600" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Date</label>
                  <input required type="date" value={newInterviewForm.date}
                    onChange={e => setNewInterviewForm({ ...newInterviewForm, date: e.target.value })}
                    className="w-full mt-1.5 p-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:border-emerald-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Time</label>
                  <input required type="time" value={newInterviewForm.time}
                    onChange={e => setNewInterviewForm({ ...newInterviewForm, time: e.target.value })}
                    className="w-full mt-1.5 p-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:border-emerald-500 outline-none text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Type</label>
                  <select value={newInterviewForm.type} onChange={e => setNewInterviewForm({ ...newInterviewForm, type: e.target.value })}
                    className="w-full mt-1.5 p-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:border-emerald-500 outline-none text-sm cursor-pointer">
                    <option>Technical</option>
                    <option>Behavioral</option>
                    <option>HR Screening</option>
                    <option>Final Round</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Mode</label>
                  <select value={newInterviewForm.mode} onChange={e => setNewInterviewForm({ ...newInterviewForm, mode: e.target.value })}
                    className="w-full mt-1.5 p-3 bg-slate-800 border border-slate-700 text-white rounded-xl focus:border-emerald-500 outline-none text-sm cursor-pointer">
                    <option>Remote (Google Meet)</option>
                    <option>Remote (Zoom)</option>
                    <option>Remote (Teams)</option>
                    <option>On-Site / In-Person</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowInterviewModal(false)}
                  className="flex-1 py-3 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl font-bold hover:bg-slate-700 transition-all text-sm">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-3 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-black transition-all text-sm">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Document */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-white">Upload Document</h2>
              <button onClick={() => setShowProfileModal(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="p-6 border-2 border-dashed border-slate-700 hover:border-slate-500 bg-slate-800/50 rounded-xl text-center transition-all">
                <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <label className="cursor-pointer">
                  <p className="text-sm font-bold text-slate-300 mb-1">
                    {resumeFile ? resumeFile.name : 'Click to select a PDF'}
                  </p>
                  <p className="text-xs text-slate-600">CV, Certificate, or ID document</p>
                  <input type="file" accept=".pdf,.doc,.docx"
                    onChange={e => setResumeFile(e.target.files[0])}
                    className="hidden" />
                </label>
              </div>
              {profile.resume_url && !resumeFile && (
                <p className="text-xs text-emerald-500 font-medium text-center flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Resume already on file — uploading will replace it
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowProfileModal(false)}
                  className="flex-1 py-3 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl font-bold hover:bg-slate-700 transition-all text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={uploading || !resumeFile}
                  className="flex-1 py-3 bg-blue-500 hover:bg-blue-400 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-black transition-all text-sm">
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternDashboard;
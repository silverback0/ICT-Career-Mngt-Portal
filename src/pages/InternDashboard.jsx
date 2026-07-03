import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Award, Clock, CheckCircle2, UserPlus, Sparkles, Building, MapPin, 
  GraduationCap, LogOut, TrendingUp, Zap, Users
} from 'lucide-react';

const InternDashboard = ({ talentId }) => {
  const [profile, setProfile] = useState(null);
  const [scores, setScores] = useState(null);
  const [skills, setSkills] = useState([]);
  const [applications, setApplications] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [newInterviewForm, setNewInterviewForm] = useState({
    company: '',
    position: '',
    date: '',
    time: '',
    type: 'Technical',
    mode: 'Remote'
  });
  
  // Onboarding Form State
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    county: '',
    cohort: 'Cohort 24/25',
    skills: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // NEW: Modal and Form States for Phase 2
  const [showAppModal, setShowAppModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newAppForm, setNewAppForm] = useState({ company: '', position: '', status: 'Backlog' });
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    const fetchAllDashboardData = async () => {
      try {
        if (!talentId) return;

        // 1. Fetch Profile
        const { data: talentData } = await supabase
          .from('talents')
          .select('*')
          .eq('id', talentId)
          .maybeSingle();

        if (talentData) {
          setProfile(talentData);
          
          // 2. Fetch Scores
          const { data: scoreData, error: scoreError } = await supabase
            .from('verified_scores')
            .select('*')
            .eq('intern_id', talentId) 
            .maybeSingle();
    
          if (scoreError) console.error("Score fetch error:", scoreError);
          if (scoreData) setScores(scoreData);

          // 3. Fetch Skills
          const { data: skillsData } = await supabase
            .from('talent_skills')
            .select('skill_name')
            .eq('talent_id', talentData.id); 
            
          if (skillsData) setSkills(skillsData);

          // 4. Fetch Real Pipeline Applications
          const { data: appsData } = await supabase
            .from('applications')
            .select('*')
            .eq('intern_id', talentId);
            
          if (appsData) setApplications(appsData);

          // 5. Fetch Global Jobs Pool (Simulating Recommendations)
          const { data: jobsData } = await supabase
            .from('jobs')
            .select('*')
            .limit(3);
            
          if (jobsData) {
            const mappedJobs = jobsData.map((job, idx) => ({
              id: job.id,
              title: job.title,
              company: job.company,
              location: job.location,
              type: job.type,
              salary: job.salary || 'Negotiable',
              match: idx === 0 ? 92 : 78,
              skills: job.tags || []
            }));
            setRecommendedJobs(mappedJobs);
          }

          // 6. Fetch Upcoming Interviews
          const { data: interviewData } = await supabase
            .from('interviews')
            .select('*')
            .eq('intern_id', talentId)
            .order('interview_date', { ascending: true });
  
          if (interviewData && interviewData.length > 0) {
            const mappedInterviews = interviewData.map(int => {
              const dateObj = new Date(int.interview_date);
              return {
                id: int.id,
                company: int.company,
                position: int.position,
                date: dateObj.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }).toUpperCase(),
                time: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                type: int.type,
                mode: int.mode
              };
            });
            setUpcomingInterviews(mappedInterviews);
          }

          // NEW: Check if admin pre-registered this person by email
          const { data: authData } = await supabase.auth.getUser();
          const user = authData?.user;

          if (user?.email) {
            const { data: invite } = await supabase
              .from('pending_invites')
              .select('*')
              .eq('email', user.email)
              .maybeSingle();

            if (invite) {
              // Pre-fill the onboarding form with admin's data
              setFormData({
                name: invite.name || '',
                position: invite.position || '',
                county: invite.county || '',
                cohort: invite.cohort || 'Cohort 2024/25',
                skills: invite.skills ? invite.skills.join(', ') : ''
              });
            }
          }
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllDashboardData();
  }, [talentId]);

  // Calculate Pipeline Stats dynamically
  const pipelineStats = {
    backlog: applications.filter(a => a.status === 'Backlog').length,
    tailoring: applications.filter(a => a.status === 'Tailoring').length,
    inPlay: applications.filter(a => a.status === 'In-Play').length,
    hired: applications.filter(a => a.status === 'Hired').length
  };

  const totalApplications = applications.length;
  const successRate = totalApplications > 0 
    ? Math.round((pipelineStats.inPlay / totalApplications) * 100)
    : 0;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data: talent, error: talentError } = await supabase
        .from('talents')
        .insert([{ id: talentId, name: formData.name, position: formData.position, county: formData.county, cohort: formData.cohort, status: 'National Pipeline' }])
        .select()
        .single();

      if (talentError) throw talentError;

      const skillList = formData.skills.split(',').map(s => ({
        talent_id: talent.id,
        skill_name: s.trim()
      }));

      const { error: skillError } = await supabase.from('talent_skills').insert(skillList);
      if (skillError) throw skillError;

      setProfile(talent); 
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // NEW: Handle adding a new job application
  const handleAddApplication = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('applications')
        .insert([{ 
          intern_id: talentId, 
          company: newAppForm.company, 
          position: newAppForm.position, 
          status: newAppForm.status 
        }])
        .select()
        .single();

      if (error) throw error;
      
      setApplications([...applications, data]);
      setShowAppModal(false);
      setNewAppForm({ company: '', position: '', status: 'Backlog' }); 
    } catch (err) {
      alert("Error adding application: " + err.message);
    }
  };

  // Handle logging a new upcoming interview
  const handleAddInterview = async (e) => {
    e.preventDefault();
    try {
      // Combine date and time inputs into a single ISO timestamp for Postgres
      const combinedDateTime = new Date(`${newInterviewForm.date}T${newInterviewForm.time}`).toISOString();

      const { data, error } = await supabase
        .from('interviews')
        .insert([{ 
          intern_id: talentId, 
          company: newInterviewForm.company, 
          position: newInterviewForm.position, 
          interview_date: combinedDateTime,
          type: newInterviewForm.type,
          mode: newInterviewForm.mode
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Map the newly inserted database row to match your UI format instantly
      const dateObj = new Date(data.interview_date);
      const formattedInterview = {
        id: data.id,
        company: data.company,
        position: data.position,
        date: dateObj.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }).toUpperCase(),
        time: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        type: data.type,
        mode: data.mode
      };

      setUpcomingInterviews([...upcomingInterviews, formattedInterview]);
      setShowInterviewModal(false);
      setNewInterviewForm({ company: '', position: '', date: '', time: '', type: 'Technical', mode: 'Remote' }); // Reset
      alert("Interview logged successfully!");
    } catch (err) {
      alert("Error saving interview: " + err.message);
    }
  };

  // NEW: Handle Resume Upload & Profile Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let finalResumeUrl = profile.resume_url; 

      if (resumeFile) {
        const fileExt = resumeFile.name.split('.').pop();
        const fileName = `${talentId}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(filePath, resumeFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('resumes')
          .getPublicUrl(filePath);
        
        finalResumeUrl = publicUrl;
      }

      const { error: updateError } = await supabase
        .from('talents')
        .update({ resume_url: finalResumeUrl })
        .eq('id', talentId);

      if (updateError) throw updateError;

      setProfile({ ...profile, resume_url: finalResumeUrl });
      setShowProfileModal(false);
      alert("Profile & Resume updated successfully!");

    } catch (err) {
      alert("Error updating profile: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 font-medium animate-pulse">Loading secure session...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="bg-slate-900 p-8 text-white flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black tracking-tight">Onboarding Setup</h1>
              <p className="text-slate-400 text-sm mt-1">Let's build your profile.</p>
            </div>
            <button onClick={handleLogout} className="text-xs font-bold text-slate-400 hover:text-white underline">Sign Out</button>
          </div>

          <form onSubmit={handleOnboardingSubmit} className="p-8 space-y-6">
            <div>
              <label className="flex text-xs font-black text-slate-500 uppercase tracking-wider mb-2 items-center gap-1">
                <UserPlus className="w-3.5 h-3.5" /> Full Name
              </label>
              <input 
                type="text" 
                required
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex text-xs font-black text-slate-500 uppercase tracking-wider mb-2 items-center gap-1">
                  <Building className="w-3.5 h-3.5" /> ICT Track
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Software Engineer"
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
                />
              </div>

              <div>
                <label className="flex text-xs font-black text-slate-500 uppercase tracking-wider mb-2 items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Home County
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Nairobi"
                  value={formData.county}
                  onChange={(e) => setFormData({...formData, county: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="flex text-xs font-black text-slate-500 uppercase tracking-wider mb-2 items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" /> Assigned Cohort
              </label>
              <select 
                value={formData.cohort}
                onChange={(e) => setFormData({...formData, cohort: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium cursor-pointer"
              >
                <option value="Cohort 24/25">Cohort 24/25</option>
                <option value="Cohort 23/24">Cohort 23/24</option>
                <option value="Cohort 22/23">Cohort 22/23</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? "Deploying Profile..." : "Complete Setup & Enter Portal"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 relative">
      {/* HEADER */}
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Intern Portal</h1>
          <p className="text-slate-500 mt-2 font-medium">
            Welcome back, <span className="text-slate-800 font-bold">{profile.name}</span>!
          </p>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl font-bold transition-all shadow-sm cursor-pointer w-fit"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* ===== 1. MY APPLICATION PIPELINE ===== */}
          <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <TrendingUp className="text-blue-500 w-5 h-5" />
              My Application Pipeline
            </h3>
            
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="text-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-3xl font-black text-slate-900">{pipelineStats.backlog}</p>
                <p className="text-xs text-slate-500 font-bold mt-2">In Backlog</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <p className="text-3xl font-black text-yellow-900">{pipelineStats.tailoring}</p>
                <p className="text-xs text-yellow-600 font-bold mt-2">Tailoring</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                <p className="text-3xl font-black text-purple-900">{pipelineStats.inPlay}</p>
                <p className="text-xs text-purple-600 font-bold mt-2">In-Play</p>
              </div>
              <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <p className="text-3xl font-black text-emerald-900">{pipelineStats.hired}</p>
                <p className="text-xs text-emerald-600 font-bold mt-2">Hired</p>
              </div>
            </div>

            <div className="space-y-2 p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600 font-medium">📊 <strong>Success Rate:</strong> {successRate}% ({pipelineStats.inPlay} interviews from {totalApplications} applications)</p>
              <p className="text-sm text-slate-600 font-medium">⏳ <strong>Total Applications:</strong> {totalApplications}</p>
            </div>
          </section>

          {/* ===== 2. RECOMMENDED JOBS ===== */}
          <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Sparkles className="text-amber-500 w-5 h-5" />
              Recommended For You
            </h3>
            
            <div className="space-y-4">
              {recommendedJobs.length > 0 ? (
                recommendedJobs.map((job) => (
                  <div key={job.id} className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-slate-900">{job.title}</h4>
                        <p className="text-sm text-slate-600">{job.company}</p>
                      </div>
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold">{job.match}% Match</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">📍 {job.location} • 🏛️ {job.type} • 💰 {job.salary}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {job.skills.map((skill, i) => (
                        <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{skill}</span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 italic">No matching recommendations found.</p>
              )}
            </div>
          </section>

          {/* ===== 3. UPCOMING INTERVIEWS ===== */}
          <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Clock className="text-red-500 w-5 h-5" />
              Upcoming Interviews
            </h3>
            
            <div className="space-y-3">
              {upcomingInterviews.length > 0 ? (
                upcomingInterviews.map((interview) => (
                  <div key={interview.id} className="flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="text-center min-w-11.25">
                      <p className="text-2xl font-black text-red-600">{interview.date.split(' ')[0]}</p>
                      <p className="text-xs text-red-600 font-bold">{interview.date.split(' ')[1]}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{interview.type} - {interview.company}</p>
                      <p className="text-sm text-slate-600">{interview.position}</p>
                      <p className="text-xs text-slate-500 mt-2">📍 {interview.mode} • ⏰ {interview.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 italic">No interviews scheduled. Keep applying!</p>
              )}
            </div>
          </section>

          {/* ===== 4. PERFORMANCE SCORES ===== */}
          <section>
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-4">
              <Award className="text-emerald-500 w-5 h-5" />
              Verified Performance Scores
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Technical Proficiency</p>
                <div className="mt-4">
                  <span className="text-4xl font-black text-slate-900">
                    {scores?.technical_proficiency || "N/A"}
                  </span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Work Ethic & Soft Skills</p>
                <div className="mt-4">
                  <span className="text-4xl font-black text-slate-900">
                    {scores?.work_ethic || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ===== 5. ROTATION STATUS ===== */}
          <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Clock className="text-orange-500 w-5 h-5" />
              Current Rotation Status
            </h3>
            <div className="flex items-center gap-4 p-4 bg-orange-50 border border-orange-100 rounded-xl">
               <div>
                 <p className="font-bold text-orange-900">{profile.status}</p>
                 <p className="text-sm text-orange-700">Tracked in live admin workspace.</p>
               </div>
            </div>
          </section>

          {/* ===== 6. TECHNICAL SKILLSET ===== */}
          <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Sparkles className="text-purple-500 w-5 h-5" />
              Technical Skillset
            </h3>
            <div className="flex flex-wrap gap-2">
              {skills.length > 0 ? (
                skills.map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold border border-slate-200">
                    {s.skill_name}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-400 italic">No skills listed yet.</p>
              )}
            </div>
          </section>

        </div>

        {/* ===== RIGHT SIDEBAR ===== */}
        <aside className="space-y-6">
          {/* NEXT STEPS */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
            <h3 className="font-bold text-lg mb-2">Next Steps</h3>
            <p className="text-slate-400 text-sm mb-6">Pipeline status update.</p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                Profile Setup Complete
              </li>
              <li className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                Add {5 - totalApplications <= 0 ? 0 : 5 - totalApplications} More Applications
              </li>
              <li className={`flex items-center gap-3 text-sm ${upcomingInterviews.length > 0 ? 'text-white' : 'text-slate-400'}`}>
                {upcomingInterviews.length > 0 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-600 shrink-0"></div>
                )}
                Get First Interview
              </li>
              <li className={`flex items-center gap-3 text-sm ${pipelineStats.hired > 0 ? 'text-white' : 'text-slate-400'}`}>
                {pipelineStats.hired > 0 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-600 shrink-0"></div>
                )}
                Secure Job Offer
              </li>
            </ul>
          </div>

          {/* COHORT STATS */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Users className="text-indigo-500 w-5 h-5" />
              Cohort ({profile.cohort})
            </h3>
            <div className="space-y-2 text-sm">
              <p className="text-slate-600"><strong>Total:</strong> 24 interns</p>
              <p className="text-emerald-600 font-bold">✓ Already Hired: 3</p>
              <p className="text-purple-600 font-bold">🔄 In Interviews: 8</p>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200">
            <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button 
                onClick={() => setShowAppModal(true)}
                className="w-full text-left p-2 hover:bg-blue-100 rounded-lg text-sm font-bold text-blue-700 transition-all"
              >
                + Log New Application
              </button>
              
              {/* NEW BUTTON FOR INTERVIEWS */}
              <button 
                onClick={() => setShowInterviewModal(true)}
                className="w-full text-left p-2 hover:bg-blue-100 rounded-lg text-sm font-bold text-blue-700 transition-all"
              >
                🗓️ Log Scheduled Interview
              </button>

              <button 
                onClick={() => setShowProfileModal(true)}
                className="w-full text-left p-2 hover:bg-blue-100 rounded-lg text-sm font-bold text-blue-700 transition-all"
              >
                ↑ Upload Resume / Update
              </button>
              <button className="w-full text-left p-2 hover:bg-blue-100 rounded-lg text-sm font-bold text-blue-700 transition-all">
                → Browse Job Pool
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* ===== MODALS ===== */}
      
      {/* 1. Add Application Modal */}
      {showAppModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-slate-900">Log New Application</h2>
            <form onSubmit={handleAddApplication} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Company</label>
                <input 
                  type="text" 
                  required 
                  value={newAppForm.company} 
                  onChange={(e) => setNewAppForm({...newAppForm, company: e.target.value})} 
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                  placeholder="e.g. Safaricom" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Position</label>
                <input 
                  type="text" 
                  required 
                  value={newAppForm.position} 
                  onChange={(e) => setNewAppForm({...newAppForm, position: e.target.value})} 
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                  placeholder="e.g. Frontend Developer" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Current Status</label>
                <select 
                  value={newAppForm.status} 
                  onChange={(e) => setNewAppForm({...newAppForm, status: e.target.value})} 
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer"
                >
                  <option value="Backlog">Backlog</option>
                  <option value="Tailoring">Tailoring</option>
                  <option value="In-Play">In-Play</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowAppModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all shadow-sm">Save to Pipeline</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Update Profile / Upload Resume Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-slate-900">Update Resume</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="p-4 border border-dashed border-slate-300 bg-slate-50 rounded-xl text-center">
                <label className="text-sm font-bold text-slate-700 block mb-2 cursor-pointer">
                  Select PDF File
                  <input 
                    type="file" 
                    accept=".pdf"
                    onChange={(e) => setResumeFile(e.target.files[0])} 
                    className="w-full mt-2 text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer" 
                  />
                </label>
              </div>
              {profile.resume_url && !resumeFile && (
                <p className="text-xs text-emerald-600 font-medium text-center">✓ You already have a resume on file. Uploading a new one will replace it.</p>
              )}
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowProfileModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" disabled={uploading} className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-sm disabled:opacity-50">
                  {uploading ? 'Uploading...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Log Interview Modal */}
      {showInterviewModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-slate-900">Log Scheduled Interview</h2>
            <form onSubmit={handleAddInterview} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Company</label>
                  <input 
                    type="text" required 
                    value={newInterviewForm.company} 
                    onChange={(e) => setNewInterviewForm({...newInterviewForm, company: e.target.value})} 
                    className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm font-medium" 
                    placeholder="Safaricom, etc." 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Position</label>
                  <input 
                    type="text" required 
                    value={newInterviewForm.position} 
                    onChange={(e) => setNewInterviewForm({...newInterviewForm, position: e.target.value})} 
                    className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm font-medium" 
                    placeholder="Frontend Engineer" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Date</label>
                  <input 
                    type="date" required 
                    value={newInterviewForm.date} 
                    onChange={(e) => setNewInterviewForm({...newInterviewForm, date: e.target.value})} 
                    className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Time</label>
                  <input 
                    type="time" required 
                    value={newInterviewForm.time} 
                    onChange={(e) => setNewInterviewForm({...newInterviewForm, time: e.target.value})} 
                    className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Interview Type</label>
                  <select 
                    value={newInterviewForm.type} 
                    onChange={(e) => setNewInterviewForm({...newInterviewForm, type: e.target.value})} 
                    className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium cursor-pointer focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Behavioral">Behavioral</option>
                    <option value="HR Screening">HR Screening</option>
                    <option value="Final Round">Final Round</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Location Mode</label>
                  <select 
                    value={newInterviewForm.mode} 
                    onChange={(e) => setNewInterviewForm({...newInterviewForm, mode: e.target.value})} 
                    className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium cursor-pointer focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Remote (Google Meet)">Remote (Google Meet)</option>
                    <option value="Remote (Zoom)">Remote (Zoom)</option>
                    <option value="Remote (Teams)">Remote (Teams)</option>
                    <option value="On-Site / In-Person">On-Site / In-Person</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowInterviewModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all shadow-sm">Save Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default InternDashboard;
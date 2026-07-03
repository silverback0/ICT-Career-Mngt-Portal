import React, { useState } from 'react';
import { X, UserPlus, Mail, Copy, CheckCircle2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

const KENYA_COUNTIES = [
  "Baringo","Bomet","Bungoma","Busia","Elgeyo-Marakwet","Embu","Garissa",
  "Homa Bay","Isiolo","Kajiado","Kakamega","Kericho","Kiambu","Kilifi",
  "Kirinyaga","Kisii","Kisumu","Kitui","Kwale","Laikipia","Lamu","Machakos",
  "Makueni","Mandera","Marsabit","Meru","Migori","Mombasa","Murang'a",
  "Nairobi","Nakuru","Nandi","Narok","Nyamira","Nyandarua","Nyeri","Samburu",
  "Siaya","Taita-Taveta","Tana River","Tharaka-Nithi","Trans Nzoia","Turkana",
  "Uasin Gishu","Vihiga","Wajir","West Pokot"
];

const SIGNUP_URL = `${window.location.origin}/`;

export default function InviteTalentModal({ isOpen, onClose }) {
  const [selectedSkills, setSelectedSkills] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [invitedEmail, setInvitedEmail] = useState('');
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: 'Unassigned',
    position: 'ICT Intern',
    county: 'Nairobi',
    cohort: 'Cohort 2025/26',
    suitability_score: 70
  });

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(SIGNUP_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setInviteSent(false);
    setInvitedEmail('');
    setSelectedSkills('');
    setFormData({
      name: '',
      email: '',
      company: 'Unassigned',
      position: 'ICT Intern',
      county: 'Nairobi',
      cohort: 'Cohort 2025/26',
      suitability_score: 70
    });
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const skillsArray = selectedSkills
        ? selectedSkills.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      // Save to pending_invites — no auth constraint, keyed by email
      const { error } = await supabase.from('pending_invites').insert([{
        name: formData.name,
        email: formData.email,
        position: formData.position,
        company: formData.company,
        county: formData.county,
        cohort: formData.cohort,
        suitability_score: parseInt(formData.suitability_score, 10),
        skills: skillsArray
      }]);

      if (error) throw error;

      setInvitedEmail(formData.email);
      setInviteSent(true);

    } catch (err) {
      console.error("Invite error:", err);
      alert(`Could not send invite: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200">

        {/* Header */}
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Mail className="text-white w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Invite Talent</h2>
              <p className="text-xs text-slate-400 font-medium">Pre-register a candidate into the pipeline</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Success State */}
        {inviteSent ? (
          <div className="p-8 flex flex-col items-center text-center gap-6">
            <div className="bg-emerald-50 p-5 rounded-full">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">Candidate Pre-Registered</h3>
              <p className="text-sm text-slate-500">
                <span className="font-bold text-slate-700">{invitedEmail}</span> has been added to pending invites.
                Share the signup link below so they can complete their profile.
              </p>
            </div>

            {/* Invite Link Copy */}
            <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3">
              <span className="text-xs font-mono text-slate-500 truncate">{SIGNUP_URL}</span>
              <button
                onClick={handleCopyLink}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  copied
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-900 text-white hover:bg-slate-700'
                }`}
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>

            <p className="text-[11px] text-slate-400 font-medium">
              When they sign up with <span className="font-bold">{invitedEmail}</span>, their profile will be automatically pre-filled with the details you entered.
            </p>

            <button
              onClick={handleClose}
              className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all"
            >
              Done
            </button>
          </div>

        ) : (

          /* Form State */
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            <div className="grid grid-cols-2 gap-4">

              {/* Full Name */}
              <div className="col-span-2">
                <label className="block text-xs font-black uppercase text-slate-400 mb-2">Full Name</label>
                <input
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Email */}
              <div className="col-span-2">
                <label className="block text-xs font-black uppercase text-slate-400 mb-2">Email Address</label>
                <input
                  required
                  type="email"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="e.g. john.doe@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {/* Position */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-2">Position</label>
                <input
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                />
              </div>

              {/* County dropdown */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-2">County</label>
                <select
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.county}
                  onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                >
                  {KENYA_COUNTIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Cohort */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-2">Cohort</label>
                <select
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.cohort}
                  onChange={(e) => setFormData({ ...formData, cohort: e.target.value })}
                >
                  <option value="Cohort 2025/26">Cohort 2025/26</option>
                  <option value="Cohort 2024/25">Cohort 2024/25</option>
                  <option value="Cohort 2023/24">Cohort 2023/24</option>
                  <option value="Cohort 2022/23">Cohort 2022/23</option>
                </select>
              </div>

              {/* Match Score */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-400 mb-2">Match Score (%)</label>
                <input
                  type="number"
                  min="0" max="100"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.suitability_score}
                  onChange={(e) => setFormData({ ...formData, suitability_score: e.target.value })}
                />
              </div>

              {/* MDA / Organization */}
              <div className="col-span-2">
                <label className="block text-xs font-black uppercase text-slate-400 mb-2">MDA / Organization</label>
                <input
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Ministry of Health, KRA, Unassigned"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>

              {/* Skills */}
              <div className="col-span-2">
                <label className="block text-xs font-black uppercase text-slate-400 mb-2">Skills (comma separated)</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="e.g. React, Node, SQL"
                  value={selectedSkills}
                  onChange={(e) => setSelectedSkills(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className={`w-full py-4 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
                  isSaving ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <UserPlus className="w-5 h-5" />
                {isSaving ? "Registering..." : "Pre-Register & Invite"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
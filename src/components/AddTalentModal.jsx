import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';

export default function AddTalentModal({ isOpen, onClose, onAdd }) {
  // We use the exact column names from your 'talent' table
  const [formData, setFormData] = useState({
  name: '',
  company: 'Unassigned',
  position: 'ICT Intern', // Use 'position', not 'role'
  county: 'Nairobi',
  status: 'In Pipeline',
  vetting_status: 'Pending',
  cohort: 'Cohort 2024/25',
  suitability_score: 70
});

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ensure numbers are sent as numbers
    const finalData = {
      ...formData,
      suitability_score: parseInt(formData.suitability_score, 10)
    };
    onAdd(finalData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <UserPlus className="text-white w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Add New Talent</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-black uppercase text-slate-400 mb-2">Full Name</label>
              <input 
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="e.g. John Doe"
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-400 mb-2">Position</label>
              <input 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-400 mb-2">County</label>
              <input 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Mombasa"
                onChange={(e) => setFormData({...formData, county: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-400 mb-2">Cohort</label>
              <select 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={(e) => setFormData({...formData, cohort: e.target.value})}
              >
                <option value="Cohort 2024/25">Cohort 2024/25</option>
                <option value="Cohort 2023/24">Cohort 2023/24</option>
                <option value="Cohort 2022/23">Cohort 2022/23</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-400 mb-2">Match Score (%)</label>
              <input 
                type="number"
                min="0" max="100"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.suitability_score}
                onChange={(e) => setFormData({...formData, suitability_score: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Save to Pipeline
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
import React, { useState } from 'react';

export default function PlacementModal({ person, onClose, onConfirm }) {
  const [selectedMDA, setSelectedMDA] = useState('');
  const [loading, setLoading] = useState(false);

  const mdaList = [
    "Ministry of ICT & Digital Economy",
    "Public Service Commission",
    "ICT Authority",
    "Konza Technopolis",
    "National Treasury",
    "State Dept for Devolution"
  ];

  const handleConfirm = async () => {
    if (!selectedMDA) return alert("Please select a destination MDA");
    setLoading(true);
    
    // Construct the updated record  
  const updatedRecord = {
    ...person,
    status: "Placed (Public)",
    company: selectedMDA,
    placedDate: new Date().toISOString(), // <--- ADD THIS LINE
    notes: `Placed via Dashboard on ${new Date().toLocaleDateString()}`
  };

    await onConfirm(updatedRecord);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Placement Action</h2>
              <p className="text-slate-500 text-sm">Deploying {person.name} to PnP role</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target MDA / Agency</label>
              <select 
                value={selectedMDA}
                onChange={(e) => setSelectedMDA(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select Department...</option>
                {mdaList.map(mda => <option key={mda} value={mda}>{mda}</option>)}
              </select>
            </div>

            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
              <p className="text-xs text-blue-700 font-medium">
                <strong>Current Suitability:</strong> {person.suitabilityScore}% <br/>
                This action will update the national database and notify the candidate.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:bg-blue-300 transition-all shadow-lg shadow-blue-100"
          >
            {loading ? "Updating..." : "Confirm Placement"}
          </button>
        </div>
      </div>
    </div>
  );
}
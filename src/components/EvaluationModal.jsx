import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const EvaluationModal = ({ talentId, onClose }) => { // Changed prop to talentId
  const [scores, setScores] = useState({ technical_proficiency: 0, work_ethic: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Using talent_id to match your existing database structure
    const payload = {
      talent_id: talentId, 
      technical_proficiency: Number(scores.technical_proficiency),
      work_ethic: Number(scores.work_ethic)
    };

    const { error } = await supabase.from('verified_scores').insert([payload]);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl w-full max-w-sm shadow-xl">
        <h2 className="text-lg font-bold mb-4">Evaluate Talent</h2>
        
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        
        <label className="block text-sm font-semibold mb-2">Technical Proficiency (1-10)</label>
        <input 
          type="number" 
          min="1" max="10"
          className="w-full p-2 border rounded mb-4"
          onChange={(e) => setScores({...scores, technical_proficiency: e.target.value})} 
        />

        <label className="block text-sm font-semibold mb-2">Work Ethic (1-10)</label>
        <input 
          type="number" 
          min="1" max="10"
          className="w-full p-2 border rounded mb-4"
          onChange={(e) => setScores({...scores, work_ethic: e.target.value})} 
        />

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-slate-500">Cancel</button>
          <button 
            type="submit" 
            disabled={loading}
            className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
          >
            {loading ? 'Saving...' : 'Save Scores'}
          </button>
        </div>
      </form>
    </div>
  );
};
export default EvaluationModal;
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const InternDashboard = ({ talentId }) => {
  const [scores, setScores] = useState(null);

  useEffect(() => {
    const fetchMyScores = async () => {
      const { data } = await supabase
        .from('verified_scores')
        .select('*')
        .eq('talent_id', talentId)
        .single();
      setScores(data);
    };
    fetchMyScores();
  }, [talentId]);

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">Your Official Performance</h1>
      <div className="mt-6 flex gap-6">
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
          <p className="text-sm text-blue-600 font-bold">Technical</p>
          <p className="text-3xl">{scores?.technical_proficiency || 'TBD'}</p>
        </div>
        <div className="bg-green-50 p-6 rounded-xl border border-green-100">
          <p className="text-sm text-green-600 font-bold">Work Ethic</p>
          <p className="text-3xl">{scores?.work_ethic || 'TBD'}</p>
        </div>
      </div>
    </div>
  );
};

export default InternDashboard;
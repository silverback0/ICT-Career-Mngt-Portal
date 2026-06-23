import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { PlusCircle } from 'lucide-react';

const AdminJobPoster = () => {
  const [job, setJob] = useState({ title: '', company: '', location: '', type: 'Full-time', salary: '', tags: '' });

  const postJob = async (e) => {
    e.preventDefault();
    const tagArray = job.tags.split(',').map(tag => tag.trim());
    
    const { error } = await supabase.from('jobs').insert([{
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      salary: job.salary,
      tags: tagArray
    }]);

    if (error) alert("Error: " + error.message);
    else {
      alert("Job posted to pipeline!");
      setJob({ title: '', company: '', location: '', type: 'Full-time', salary: '', tags: '' });
    }
  };

  return (
    <form onSubmit={postJob} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-lg">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><PlusCircle className="text-blue-500" /> Post New ICT Job</h2>
      <input className="w-full p-3 mb-3 border rounded-xl" placeholder="Job Title" value={job.title} onChange={e => setJob({...job, title: e.target.value})} />
      <input className="w-full p-3 mb-3 border rounded-xl" placeholder="Company" value={job.company} onChange={e => setJob({...job, company: e.target.value})} />
      <input className="w-full p-3 mb-3 border rounded-xl" placeholder="Location (e.g. Nairobi)" value={job.location} onChange={e => setJob({...job, location: e.target.value})} />
      <input className="w-full p-3 mb-3 border rounded-xl" placeholder="Tags (comma separated, e.g. Python, SQL)" value={job.tags} onChange={e => setJob({...job, tags: e.target.value})} />
      <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Deploy to Pipeline</button>
    </form>
  );
};

export default AdminJobPoster;
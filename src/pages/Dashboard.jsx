import React from 'react';
import { useJob } from '../context/JobContext.jsx';
import JobCard from '../components/JobCard.jsx';
import { useState } from 'react';
import EvaluationModal from '../components/EvaluationModal.jsx';

const STATUSES = [
  'National Pipeline',      // Sourcing new talent
  'Verification Phase',     // Vetting MDA history/performance
  'MDA Rotation (Active)',  // Currently serving in an MDA
  'Deployment Ready',       // Finished rotation, ready for absorption
  'Placed (Public)',        // Permanent Government Role
  'Placed (Private)',       // Transitioned to Private Sector partner
  'Attrition/Inactive'      // Exited the government program
];

function Dashboard() {
  const { jobs, moveJob, deleteJob, searchTerm } = useJob();
  const [activeColumn, setActiveColumn] = useState(null);
  const [activeEval, setActiveEval] = useState(null);

  // Filter jobs by status and search query
  const getJobsByStatus = (status) => {
    // 1. Use searchTerm (and handle if it's undefined with || '')
    const query = (searchTerm || '').toLowerCase(); 
    
    return jobs.filter(job => {
      const matchesStatus = job.status === status;
      
      // 2. Add ?. to company and position to prevent crashing on null fields
      const matchesSearch = !query || 
        job?.company?.toLowerCase().includes(query) ||
        job?.position?.toLowerCase().includes(query);
        
      return matchesStatus && matchesSearch;
    });
  };

  // Drag and drop handlers
  const handleDragOver = (e, status) => {
  e.preventDefault();
  if (activeColumn !== status) {
    setActiveColumn(status); // Set the current column as the active one
  }
};

  const handleDrop = (e, status) => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData('jobId');
    if (jobId) {
      moveJob(Number(jobId), status);
    }
  };

  const handleDragStart = (e, jobId) => {
    e.dataTransfer.setData('jobId', String(jobId));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-8">
      <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        {STATUSES.map(status => {
          const isDraggingOver = activeColumn === status;
          const statusJobs = getJobsByStatus(status);
          const isEmpty = statusJobs.length === 0;

          return (
            <div
              key={status}
              onDragOver={handleDragOver}
              onDragLeave={() => setActiveColumn(null)}
              onDrop={(e) => {handleDrop(e, status); setActiveColumn(null)}}
              className={`shrink-0 w-85 rounded-xl flex flex-col max-h-[calc(100vh-120px)] border transition-all duration-300${isDraggingOver ? 'bg-slate-50 border-teal-300' : 'bg-white/80 border-slate-200'}`}
            >
              {/* Column Header */}
              <div className="p-5 border-b border-slate-200 flex justify-between items-center">
                <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                  <span>{status}</span>
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {statusJobs.length}
                  </span>
                </h2>
              </div>

              {activeEval && (
                <EvaluationModal 
                  talentId={activeEval} 
                  onClose={() => setActiveEval(null)} 
                />
              )}

              {/* Cards Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                {statusJobs.map(job => (
                  <div
                    key={job.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, job.id)}  
                    className="cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                  >
                    <JobCard 
                     job={job} 
                      onDelete={deleteJob} 
                      userRole="admin" 
                      onEvaluate={(job) => setActiveEval(job.id)} 
                    />
                  </div>
                ))}

                {/* Empty State */}
                {isEmpty && (
                  <div className="flex items-center justify-center h-40 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50 transition-colors hover:border-slate-300">
                    <p className="text-slate-400 text-sm font-medium">
                      Drop jobs here
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Dashboard;
import React from 'react';
import { useJob } from '../context/JobContext.jsx';
import JobCard from '../components/JobCard.jsx';

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
  const { jobs, moveJob, deleteJob, searchQuery } = useJob();

  // Filter jobs by status and search query
  const getJobsByStatus = (status) => {
    const query = searchQuery.toLowerCase();
    return jobs.filter(job => {
      const matchesStatus = job.status === status;
      const matchesSearch = !query || 
        job.company.toLowerCase().includes(query) ||
        job.position.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        {STATUSES.map(status => {
          const statusJobs = getJobsByStatus(status);
          const isEmpty = statusJobs.length === 0;

          return (
            <div
              key={status}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
              className="flex-shrink-0 w-[340px] bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200 flex flex-col max-h-[calc(100vh-120px)]"
            >
              {/* Column Header */}
              <div className="p-5 border-b border-slate-200">
                <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
                  <span>{status}</span>
                  <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 bg-slate-100 text-slate-500 rounded-full text-xs font-semibold">
                    {statusJobs.length}
                  </span>
                </h2>
              </div>

              {/* Cards Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                {statusJobs.map(job => (
                  <div
                    key={job.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, job.id)}
                    className="cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                  >
                    <JobCard job={job} onDelete={deleteJob} />
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
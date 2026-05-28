import React, { createContext, useContext, useState, useEffect } from 'react';

export const JobContext = createContext();

export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [selectedCohort, setSelectedCohort] = useState('All Cohorts');
  const [searchQuery, setSearchQuery] = useState('');

  // Initial Fetch
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // Change '/jobs' to '/api/jobs' to match your Postgres server
        let url = 'http://localhost:5000/api/jobs'; 
        if (selectedCohort !== 'All Cohorts') {
          url += `?cohort=${encodeURIComponent(selectedCohort)}`;
        }
        const response = await fetch(url);
        const data = await response.json();
        setJobs(data);
      } catch (error) {
        console.error("Failed to load jobs:", error);
      }
    };
    fetchJobs();
  }, [selectedCohort]);

  const addJob = async (newJobData) => {
  const response = await fetch('http://localhost:5000/api/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Ensure the keys here match your server/database columns
    body: JSON.stringify(newJobData) 
  });
  
  if (!response.ok) throw new Error("Server failed to save");
  
  const savedJob = await response.json();
  setJobs(prev => [...prev, savedJob]);
  };

  const updateJob = async (updatedJob) => {
    await fetch(`http://localhost:5000/jobs/${updatedJob.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedJob)
    });
    setJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
  };

  const deleteJob = async (id) => {
    await fetch(`http://localhost:5000/jobs/${id}`, { method: 'DELETE' });
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  const moveJob = async (jobId, newStatus) => {
    const jobToMove = jobs.find(j => j.id === jobId);
    if (jobToMove) {
      updateJob({ ...jobToMove, status: newStatus });
    }
  };

  return (
    /* We include setJobs here so the Dashboard can update the context state */
    <JobContext.Provider value={{ jobs, setJobs, addJob, updateJob, deleteJob, moveJob, searchQuery, setSearchQuery, selectedCohort, setSelectedCohort }}>
      {children}
    </JobContext.Provider>
  );
};

export const useJob = () => useContext(JobContext);
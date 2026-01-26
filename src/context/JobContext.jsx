// src/context/JobContext.jsx
import React, { createContext, useContext, useCallback, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage"; 

export const JobContext = createContext();

// Placeholder jobs removed for a clean "Production" state
const initialJobs = []; 

export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useLocalStorage("devTrackJobs", initialJobs);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingJob, setEditingJob] = useState(null); // Added for Edit Modal control

  // 1. Manual Entry
  const addJob = useCallback(newJob => {
    setJobs(prevJobs => [...prevJobs, { 
      id: Date.now().toString(), 
      isVerified: false, // Prep for Employer stage
      ...newJob 
    }]);
  }, [setJobs]);

  // 2. JSearch Results Integration
  const addJobFromSearch = useCallback((apiJob) => {
    const formattedJob = {
      id: Date.now().toString(),
      company: apiJob.employer_name,
      position: apiJob.job_title,
      status: 'Backlog', 
      location: apiJob.job_city || 'Kenya',
      link: apiJob.job_apply_link,
      interviewDate: null,
      isVerified: false, // Default to unverified until Employer confirms
      dateAdded: new Date().toLocaleDateString(),
      notes: '' 
    };
    
    setJobs(prevJobs => [...prevJobs, formattedJob]);
    alert(`🚀 ${apiJob.job_title} tracked in Backlog!`);
  }, [setJobs]);

  // 3. Move Job (Standardized ID comparison)
  const moveJob = useCallback((jobId, newStatus) => { 
    setJobs(prevJobs =>
      prevJobs.map(job => String(job.id) === String(jobId) ? { ...job, status: newStatus } : job)
    );
  }, [setJobs]);

  // 4. Update existing job (Required for EditModal)
  const updateJob = useCallback((updatedJob) => {
    setJobs(prevJobs =>
      prevJobs.map(job => job.id === updatedJob.id ? updatedJob : job)
    );
  }, [setJobs]);

  const deleteJob = useCallback(jobId => {
    setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
  }, [setJobs]);

  const contextValue = { 
    jobs, 
    addJob, 
    addJobFromSearch, 
    moveJob, 
    updateJob,
    deleteJob, 
    editingJob,
    setEditingJob,
    searchQuery, 
    setSearchQuery 
  };

  return (
    <JobContext.Provider value={contextValue}>
      {children}
    </JobContext.Provider>
  );
};

export const useJob = () => useContext(JobContext);
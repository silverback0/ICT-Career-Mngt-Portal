// src/context/JobContext.jsx
import React, { createContext, useContext, useCallback, useState, useEffect } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage"; 

export const JobContext = createContext();

// Placeholder jobs removed for a clean "Production" state
const initialJobs = []; 

export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useLocalStorage("devTrackJobs", initialJobs);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingJob, setEditingJob] = useState(null); 
  const [ministryMode, setMinistryMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);


  // 1. Manual Entry
  const addJob = (newJob) => {
    const enrichedJob = enrichJob(newJob);
    setJobs(prevJobs => [...prevJobs, enrichedJob]);
  };

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

  useEffect(() => {
  const savedJobs = localStorage.getItem('ministry-jobs');
  if (savedJobs && jobs.length === 0) {
    // Only load on initial mount if jobs array is empty
    try {
      setJobs(JSON.parse(savedJobs));
    } catch (error) {
      console.error('Error loading saved jobs:', error);
    }
  }
}, []); // Empty dependency array - only run once on mount

// ✅ This one saves jobs whenever they change
useEffect(() => {
  if (jobs.length > 0) {
    localStorage.setItem('ministry-jobs', JSON.stringify(jobs));
    localStorage.setItem('ministry-last-update', new Date().toISOString());
  }
}, [jobs]);

  // ✅ ADD THIS - Helper function to add ministry-specific fields to jobs
  const enrichJob = (job) => {
    return {
      ...job,
      // Add these fields if they don't exist
      county: job.county || 'Nairobi',
      jobSource: job.jobSource || 'Manual',
      skillsRequired: job.skillsRequired || [],
      employmentType: job.employmentType || 'Full-time',
      isVerified: job.isVerified || false,
      scrapedDate: job.scrapedDate || new Date().toISOString(),
      salaryRange: job.salaryRange || { min: 0, max: 0 }
    };
  };


  const contextValue = { 
    jobs, 
    addJob,
    setJobs,
    addJobFromSearch, 
    moveJob, 
    updateJob,
    deleteJob, 
    editingJob,
    setEditingJob,
    searchQuery, 
    setSearchQuery,
    ministryMode,   
    setMinistryMode, 
    isLoading,      
    setIsLoading,   
  };

  return (
    <JobContext.Provider value={contextValue}>
      {children}
    </JobContext.Provider>
  );
};

export const useJob = () => useContext(JobContext);
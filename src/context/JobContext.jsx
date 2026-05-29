import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';

export const JobContext = createContext();

export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [selectedCohort, setSelectedCohort] = useState('All Cohorts');
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCounty, setFilterCounty] = useState("All");
  const [activeDrillDown, setActiveDrillDown] = useState({ type: null, value: null });

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

  const updateJob = async (updatedData) => {
  try {
    const response = await fetch(`http://localhost:5000/api/jobs/${updatedData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    });

    if (response.ok) {
      setJobs(prevJobs => prevJobs.map(job => job.id === updatedData.id ? updatedData : job));
      
      // THIS IS YOUR NOTIFICATION
      alert("✅ Talent Profile Updated Successfully!"); 
      
    } else {
      alert("❌ Failed to update. Server error.");
    }
  } catch (error) {
    console.error("Update Error:", error);
    alert("❌ System Error: Could not reach the server.");
  }
};
  const deleteJob = async (id) => {
  try {
    const response = await fetch(`http://localhost:5000/api/jobs/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      // Update local state so the person vanishes instantly without a refresh
      setJobs(prevJobs => prevJobs.filter(job => job.id !== id));
      alert("Talent removed from pipeline.");
    } else {
      throw new Error("Failed to delete");
    }
  } catch (error) {
    console.error("Error deleting talent:", error);
    alert("Could not delete talent.");
  }
};

  const moveJob = async (jobId, newStatus) => {
    const jobToMove = jobs.find(j => j.id === jobId);
    if (jobToMove) {
      updateJob({ ...jobToMove, status: newStatus });
    }
  };

  const filteredJobs = useMemo(() => {
  const safeJobs = Array.isArray(jobs) ? jobs : [];
  const query = (searchTerm || '').toLowerCase();

  return safeJobs.filter(job => {
    // 1. Search Logic (Name, ID, or Position)
    const matchesSearch = !query || 
      job?.name?.toLowerCase().includes(query) || 
      job?.id?.toString() === query ||
      job?.position?.toLowerCase().includes(query);
      
    // 2. County Logic (Merged Map + Dropdown)
    const matchesCounty = filterCounty === "All" || job?.county === filterCounty;
    
    // 3. Cohort Logic (Already handled by API fetch, but good for safety)
    const matchesCohort = selectedCohort === "All Cohorts" || job?.cohort === selectedCohort;

    return matchesSearch && matchesCounty && matchesCohort;
  });
}, [jobs, searchTerm, filterCounty, selectedCohort]);

  return (
    /* We include setJobs here so the Dashboard can update the context state */
    <JobContext.Provider value={{ jobs, setJobs, addJob, updateJob, deleteJob, filteredJobs, searchTerm, filterCounty, setFilterCounty, setSearchTerm, moveJob, selectedCohort, setSelectedCohort }}>
      {children}
    </JobContext.Provider>
  );
};

export const useJob = () => useContext(JobContext);
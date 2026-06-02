import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const JobContext = createContext();

export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [selectedCohort, setSelectedCohort] = useState('All Cohorts');
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCounty, setFilterCounty] = useState("All");
  const [activeDrillDown, setActiveDrillDown] = useState({ type: null, value: null });
  const [editingJob, setEditingJob] = useState(null);

  // Initial Fetch
  useEffect(() => {
    const fetchJobs = async () => {
      let query = supabase.from('talents').select('*');
      
      if (selectedCohort !== 'All Cohorts') {
        query = query.eq('cohort', selectedCohort);
      }
      
      const { data, error } = await query;
      if (error) console.error("Error loading jobs:", error);
      else setJobs(data || []);
    };
    fetchJobs();
  }, [selectedCohort]);

  const addJob = async (newJobData) => {
    const { data, error } = await supabase.from('talents').insert([newJobData]).select();
    if (error) {
      console.error("Error adding job:", error);
      throw error;
    }
    setJobs(prev => [...prev, ...data]);
  };

  const updateJob = async (updatedData) => {
    const { error } = await supabase
      .from('talents')
      .update(updatedData)
      .eq('id', updatedData.id);

    if (error) {
      alert("❌ Failed to update.");
      console.error(error);
    } else {
      setJobs(prev => prev.map(job => job.id === updatedData.id ? updatedData : job));
    }
  };

  const deleteJob = async (id) => {
    const { error } = await supabase.from('talents').delete().eq('id', id);
    if (error) {
      alert("Could not delete.");
    } else {
      setJobs(prev => prev.filter(job => job.id !== id));
    }
  };

  const moveJob = async (jobId, newStatus) => {
    const jobToMove = jobs.find(j => j.id === jobId);
    if (jobToMove) updateJob({ ...jobToMove, status: newStatus });
  };

  const filteredJobs = useMemo(() => {
    const query = (searchTerm || '').toLowerCase();
    return jobs.filter(job => {
      const matchesSearch = !query || job.name?.toLowerCase().includes(query) || job.position?.toLowerCase().includes(query);
      const matchesCounty = filterCounty === "All" || job.county === filterCounty;
      const matchesCohort = selectedCohort === "All Cohorts" || job.cohort === selectedCohort;
      return matchesSearch && matchesCounty && matchesCohort;
    });
  }, [jobs, searchTerm, filterCounty, selectedCohort]);

  return (
    /* We include setJobs here so the Dashboard can update the context state */
    <JobContext.Provider value={{ jobs, setJobs, addJob, updateJob, deleteJob, setEditingJob, editingJob, filteredJobs, searchTerm, filterCounty, setFilterCounty, setSearchTerm, moveJob, selectedCohort, setSelectedCohort }}>
      {children}
    </JobContext.Provider>
  );
};

export const useJob = () => useContext(JobContext);
import React, { useContext, useMemo, useState, useEffect } from 'react';
import { JobContext } from '../context/JobContext';
import CountyHeatmap from './CountyHeatmap';
import SkillsGapChart from './SkillsGapChart';
import ReportGenerator from './ReportGenerator';
import { fetchAllJobs } from '../services/scrapers/scraperOrchestrator';

export default function MinistryDashboard() {
  const { jobs, setJobs } = useContext(JobContext);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Calculate statistics
  const stats = useMemo(() => {
    const totalJobs = jobs.length;
    const pscJobs = jobs.filter(j => j.jobSource === 'PSC').length;
    const privateJobs = jobs.filter(j => j.jobSource !== 'PSC').length;
    
    const byCounty = jobs.reduce((acc, job) => {
      const county = job.county || 'Unknown';
      acc[county] = (acc[county] || 0) + 1;
      return acc;
    }, {});
    
    const allSkills = jobs.flatMap(j => j.skillsRequired || []);
    const bySkill = allSkills.reduce((acc, skill) => {
      acc[skill] = (acc[skill] || 0) + 1;
      return acc;
    }, {});
    
    // Get top 3 skills
    const topSkills = Object.entries(bySkill)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    
    return { 
      totalJobs, 
      pscJobs, 
      privateJobs, 
      byCounty, 
      bySkill,
      topSkills 
    };
  }, [jobs]);
  
  // Fetch jobs on mount
  useEffect(() => {
    const savedJobs = localStorage.getItem('ministry-jobs');
    const savedDate = localStorage.getItem('ministry-last-update');
    
    if (savedJobs) {
      setJobs(JSON.parse(savedJobs));
      setLastUpdated(savedDate);
    }
  }, []);
  
  // Manual refresh function
  const handleRefreshJobs = async () => {
    setIsLoading(true);
    try {
      const apiKey = import.meta.env.VITE_JSEARCH_API_KEY;
      const newJobs = await fetchAllJobs(apiKey);
      
      setJobs(newJobs);
      const now = new Date().toISOString();
      setLastUpdated(now);
      
      // Save to localStorage
      localStorage.setItem('ministry-jobs', JSON.stringify(newJobs));
      localStorage.setItem('ministry-last-update', now);
      
      alert(`✅ Successfully loaded ${newJobs.length} jobs!`);
    } catch (error) {
      alert('❌ Error loading jobs. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                ICT Talent Pipeline Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Ministry of ICT - Workforce Intelligence System
              </p>
              {lastUpdated && (
                <p className="text-sm text-gray-500 mt-2">
                  Last updated: {new Date(lastUpdated).toLocaleString()}
                </p>
              )}
            </div>
            <button
              onClick={handleRefreshJobs}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Updating...
                </>
              ) : (
                <>
                  🔄 Refresh Data
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total ICT Jobs"
            value={stats.totalJobs}
            icon="📊"
            color="blue"
          />
          <StatCard
            title="PSC Positions"
            value={stats.pscJobs}
            icon="🏛️"
            color="green"
            subtitle="Permanent & Pensionable"
          />
          <StatCard
            title="Private Sector"
            value={stats.privateJobs}
            icon="💼"
            color="purple"
          />
          <StatCard
            title="Top Skill"
            value={stats.topSkills[0]?.[0] || 'N/A'}
            icon="⚡"
            color="orange"
            subtitle={`${stats.topSkills[0]?.[1] || 0} jobs`}
          />
        </div>
        
        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <CountyHeatmap data={stats.byCounty} />
          <SkillsGapChart data={stats.bySkill} />
        </div>
        
        {/* Report Generator */}
        <ReportGenerator jobs={jobs} stats={stats} />
      </div>
    </div>
  );
}

// Reusable stat card component
function StatCard({ title, value, icon, color, subtitle }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    orange: 'bg-orange-50 text-orange-700'
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {subtitle && (
            <p className="text-gray-500 text-xs mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`text-4xl ${colors[color]} p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
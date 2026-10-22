import React, { useState } from 'react';
import AdminPipeline from './AdminPipeline'; // Your live Kanban/List file
import MinistryDashboard from '../components/MinistryDashboard';

// Lucide icon imports for the tab headers
import { LayoutDashboard, BarChart3 } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' or 'analytics'

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800">
      
      {/* GLOBAL WORKSPACE TOP BAR */}
      <nav className="bg-white text-slate-900 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-slate-900 flex items-center justify-center font-bold text-amber-400 text-sm">
            TD
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block -mb-0.5">Admin Console</span>
            <span className="text-base font-bold tracking-tight text-slate-900">TalentDeploy</span>
          </div>
        </div>

        {/* WORKSPACE NAVIGATION TABS */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'pipeline' 
                ? 'bg-slate-900 text-amber-400' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
            }`}
          >
            <LayoutDashboard size={14} />
            Pipeline Manager
          </button>
          
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'analytics' 
                ? 'bg-slate-900 text-amber-400' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
            }`}
          >
            <BarChart3 size={14} />
            Ministry Analytics
          </button>
        </div>
      </nav>

      {/* RENDER ACTIVE LAYER CANVAS */}
      <main className="flex-1">
        {activeTab === 'pipeline' ? (
          <AdminPipeline />
        ) : (
          <MinistryDashboard />
        )}
      </main>
    </div>
  );
}
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
      <nav className="bg-slate-900 text-white border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-3">
          <div className="bg-teal-600 text-white p-2 rounded-xl text-xs font-black tracking-widest uppercase">
            HQ
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400 block -mb-1">Internal Operations</span>
            <span className="text-base font-black tracking-tight">National Cloud Deployment Core</span>
          </div>
        </div>

        {/* WORKSPACE NAVIGATION TABS */}
        <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-xl border border-slate-700/60">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'pipeline' 
                ? 'bg-teal-600 text-white shadow-md shadow-teal-900/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
            }`}
          >
            <LayoutDashboard size={14} />
            Pipeline Manager
          </button>
          
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'analytics' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
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
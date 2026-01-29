import React, { useState } from 'react';
import { JobProvider } from './context/JobContext';
import Stats from './components/Stats';
import JobSuggestions from './components/JobSuggestions';
import Dashboard from './pages/Dashboard';
import EditJobModal from './components/EditJobModal';
import MinistryDashboard from './components/MinistryDashboard';

function App() {
  const [view, setView] = useState('user'); 

  return (
    <JobProvider>
      <div className="min-h-screen bg-slate-50 font-sans">
        {/* HEADER SECTION */}
        <header className="max-w-7xl mx-auto px-6 py-8 border-b border-gray-200 bg-white shadow-sm rounded-b-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
                DevTrack <span className="text-emerald-500">Kenya</span>
              </h1>
              <p className="text-slate-500 font-medium mt-1">ICT Career Management Portal</p>
            </div>

            {/* NAVIGATION BUTTONS */}
            <nav className="flex items-center bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setView('user')}
                className={`px-6 py-2 rounded-md font-semibold transition-all ${
                  view === 'user' 
                  ? 'bg-white text-emerald-600 shadow-md' 
                  : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                User Dashboard
              </button>
              <button 
                onClick={() => setView('ministry')}
                className={`px-6 py-2 rounded-md font-semibold transition-all ${
                  view === 'ministry' 
                  ? 'bg-emerald-500 text-white shadow-md' 
                  : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Ministry Analytics
              </button>
            </nav>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="max-w-7xl mx-auto px-6 py-10">
          {view === 'user' ? (
            <div className="space-y-12">
              <Stats />
              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-6 border-l-4 border-emerald-500 pl-4">Recommended for You</h2>
                <JobSuggestions />
              </section>
              <section>
                <h2 className="text-2xl font-bold text-slate-800 mb-6 border-l-4 border-emerald-500 pl-4">Application Pipeline</h2>
                <Dashboard />
              </section>
            </div>
          ) : (
            <section className="animate-in fade-in duration-500">
              <MinistryDashboard />
            </section>
          )}
        </main>

        <EditJobModal />
      </div>
    </JobProvider>
  );
}

export default App;
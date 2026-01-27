import React, { useState, useEffect } from 'react';
import { JobProvider } from './context/JobContext';
import Stats from './components/Stats';
import JobSuggestions from './components/JobSuggestions';
import Dashboard from './pages/Dashboard';
import EditJobModal from './components/EditJobModal';
import MinistryDashboard from './components/MinistryDashboard';
import ReportGenerator from './components/ReportGenerator';

// --- MOVE ALL STYLES HERE (Above the function) ---
const appContainer = {
  maxWidth: '1400px',
  margin: '0 auto',
  padding: '40px 20px',
  fontFamily: "'Inter', sans-serif",
  backgroundColor: '#f4f7f6',
  minHeight: '100vh'
};

const headerStyle = {
  marginBottom: '40px',
  borderBottom: '2px solid #eee',
  paddingBottom: '20px'
};

const sectionStyle = {
  marginBottom: '50px'
};

const sectionTitle = {
  fontSize: '1.5rem',
  color: '#2c3e50',
  marginBottom: '20px',
  paddingLeft: '10px'
};

const activeBtn = {
  padding: '10px 20px',
  backgroundColor: '#2ecc71',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  marginRight: '10px'
};

const inactiveBtn = {
  padding: '10px 20px',
  backgroundColor: '#bdc3c7',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  marginRight: '10px'
};


function App() {
  const [view, setView] = useState('user'); // Default to user view

  return (
    <JobProvider>
      <div style={appContainer}>
        <header style={headerStyle}>
          <h1 style={{ margin: 0, color: '#2c3e50' }}>DevTrack <span style={{color: '#2ecc71'}}>Kenya</span></h1>
          <p style={{ color: '#7f8c8d', margin: '5px 0 0 0' }}>ICT Career Management Portal</p>
          
          {/* NAVIGATION BUTTONS */}
          <nav style={{ marginTop: '20px' }}>
            <button 
              onClick={() => setView('user')}
              style={view === 'user' ? activeBtn : inactiveBtn}
            >
              User Dashboard
            </button>
            <button 
              onClick={() => setView('ministry')}
              style={view === 'ministry' ? activeBtn : inactiveBtn}
            >
              Ministry Analytics
            </button>
          </nav>
        </header>

        <main>
          {view === 'user' ? (
            <>
              <Stats />
              <section style={sectionStyle}>
                <JobSuggestions />
              </section>
              <section style={sectionStyle}>
                <h2 style={sectionTitle}>Application Pipeline</h2>
                <Dashboard />
              </section>
            </>
          ) : (
            <section style={sectionStyle}>
              <h2 style={sectionTitle}>Government Oversight Dashboard</h2>
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
import React from 'react';
import { JobProvider } from './context/JobContext';
import Stats from './components/Stats';
import JobSuggestions from './components/JobSuggestions';
import Dashboard from './pages/Dashboard';
import EditJobModal from './components/EditJobModal';


function App() {
  return (
    <JobProvider>
      <div style={appContainer}>
        {/* HEADER SECTION */}
        <header style={headerStyle}>
          <h1 style={{ margin: 0, color: '#2c3e50' }}>DevTrack <span style={{color: '#2ecc71'}}>Kenya</span></h1>
          <p style={{ color: '#7f8c8d', margin: '5px 0 0 0' }}>ICT Career Management Portal</p>
        </header>

        <main>
          {/* 1. ANALYTICS FIRST (Show the impact immediately) */}
          <Stats />

          {/* 2. SEARCH (The sourcing tool) */}
          <section style={sectionStyle}>
            <JobSuggestions />
          </section>

          {/* 3. THE BOARD (The management tool) */}
          <section style={sectionStyle}>
            <h2 style={sectionTitle}>Application Pipeline</h2>
            <Dashboard />
          </section>
        </main>

        {/* 4. THE OVERLAY (Always active but invisible until triggered) */}
        <EditJobModal />
      </div>
    </JobProvider>
  );
}

// --- GLOBAL STYLES ---
const appContainer = {
  maxWidth: '1400px',
  margin: '0 auto',
  padding: '40px 20px',
  fontFamily: "'Inter', sans-serif",
  backgroundColor: '#f4f7f6', // Light professional grey background
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

export default App;
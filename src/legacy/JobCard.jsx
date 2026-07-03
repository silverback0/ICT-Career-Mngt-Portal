import React from "react";
import { useJob } from '../context/JobContext.jsx';

const JobCard = ({ job, onDelete, userRole, onEvaluate }) => { // 1. Props added
  const { setEditingJob } = useJob();

  const colorcard = {
    'Backlog': '#95a5a6', 'Tailoring': '#9b59b6', 'Active': '#3498db',
    'In-Play': '#f1c40f', 'Offer': '#2ecc71', 'Rejected': '#e74c3c',
    'Ghosted/Archive': '#34495e'
  };

  return (
    <div 
      onClick={() => setEditingJob(job)}
      style={{
        ...cardContainerStyle, 
        borderLeft: `6px solid ${colorcard[job.status] || '#ccc'}`,
        cursor: 'pointer'
      }}
    >
      <div style={headerStyle}>
        <h4 style={positionStyle}>{job.position}</h4>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(job.id); }} 
          style={deleteBtnStyle}
        > &times; </button>
      </div>

      <p style={companyStyle}><strong>{job.company}</strong></p>

      {/* ADMIN EVALUATION TRIGGER */} 
      {userRole === 'admin' && (
        <button 
          onClick={(e) => { e.stopPropagation(); onEvaluate(job); }} 
          style={adminBtnStyle}
        >
          🎯 Evaluate Intern
        </button>
      )}

      {job.interviewDate && (
        <p style={dateStyle}>📅 {new Date(job.interviewDate).toLocaleDateString()}</p>
      )}

      {job.link && (
        <a href={job.link} target="_blank" rel="noreferrer" style={linkStyle}>
          🔗 View Job Posting
        </a>
      )}

      {job.notes && (
        <div style={notesBoxStyle}>
          <p style={{ margin: 0 }}>📝 {job.notes}</p>
        </div>
      )}
    </div>
  );
};

// --- STYLES ---
const adminBtnStyle = {
  backgroundColor: '#f0fdfa',
  color: '#0d9488',
  border: '1px solid #ccfbf1',
  borderRadius: '6px',
  padding: '4px 8px',
  fontSize: '11px',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginBottom: '8px'
};

const cardContainerStyle = {
  padding: '16px',
  margin: '12px 0',
  borderRadius: '10px',
  backgroundColor: 'white',
  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
  transition: 'transform 0.1s ease',
  position: 'relative'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '8px'
};

const positionStyle = { 
  margin: 0, 
  fontSize: '1.05rem', 
  color: '#2c3e50',
  fontWeight: '700'
};

const deleteBtnStyle = { 
  background: 'none', 
  border: 'none', 
  cursor: 'pointer', 
  color: '#cbd5e0', 
  fontSize: '20px',
  lineHeight: '1',
  padding: '0 0 0 10px'
};

const companyStyle = { 
  margin: '0 0 10px 0', 
  fontSize: '0.95rem', 
  color: '#555' 
};

const dateStyle = { 
  margin: '0 0 10px 0', 
  fontSize: '0.85rem', 
  color: '#3498db',
  fontWeight: '600'
};

const linkStyle = { 
  display: 'inline-block', 
  fontSize: '12px', 
  color: '#3498db', 
  textDecoration: 'none', 
  marginBottom: '10px',
  fontWeight: 'bold',
  borderBottom: '1px solid transparent',
  transition: 'border-color 0.2s'
};

const notesBoxStyle = { 
  backgroundColor: '#f8f9fa', 
  padding: '10px', 
  borderRadius: '8px', 
  fontSize: '12px', 
  color: '#4a5568', 
  border: '1px solid #edf2f7',
  lineHeight: '1.4'
};

export default JobCard;
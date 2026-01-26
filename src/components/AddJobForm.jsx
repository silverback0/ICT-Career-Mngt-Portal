// src/components/AddJobForm.jsx

import React, { useState } from 'react';
import { useJob } from '../context/JobContext.jsx';

function AddJobForm() {
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [date, setDate] = useState('');
  const { addJob } = useJob();
  const [link, setLink] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!company || !position) return alert('Please fill in Company and Position');

    addJob({
      company,
      position,
      interviewDate: date || null,
      link: link || null,
      notes: notes || null,
      status: 'Backlog'
    });

    setCompany('');
    setPosition('');
    setDate('');
    setLink('');
    setNotes('');
  };

  return (
    <section style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd' }}>
      <h3>Add New Job Application</h3>
      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={inputGroupStyle}>
          <label>Company:</label>
          <input 
            type="text" 
            placeholder="e.g. Google" 
            value={company} 
            onChange={(e) => setCompany(e.target.value)} 
            style={inputStyle}
          />
        </div>
        
        <div style={inputGroupStyle}>
          <label>Position:</label>
          <input 
            type="text" 
            placeholder="e.g. React Dev" 
            value={position} 
            onChange={(e) => setPosition(e.target.value)} 
            style={inputStyle}
          />
        </div>

        <div style={inputGroupStyle}>
          <label>Date (Optional):</label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            style={inputStyle}
          />
        </div>

        <button type="submit" style={buttonStyle}>Add to Tracker</button>

            <h3 style={{marginTop: 0}}>➕ Add New Opportunity</h3>
            <div style={inputGroup}>
                <input type="text" placeholder="Company Name*" value={company} onChange={(e)=>setCompany(e.target.value)} style={inputStyle} required />
                <input type="text" placeholder="Position*" value={position} onChange={(e)=>setPosition(e.target.value)} style={inputStyle} required />
            </div>
            <input type="url" placeholder="Job Link (URL)" value={link} onChange={(e)=>setLink(e.target.value)} style={inputStyle} />
            <textarea placeholder="Notes (Salary, Tech Stack, Recruiter name...)" value={notes} onChange={(e)=>setNotes(e.target.value)} style={{...inputStyle, minHeight: '60px'}} />
            <button type="submit" style={buttonStyle}>Add to Tracker</button>
      </form>
    </section>
  );
}

// STYLES - Updated for high visibility
const formStyle = { 
  display: 'flex', 
  gap: '15px', 
  justifyContent: 'center', 
  alignItems: 'flex-end',
  flexWrap: 'wrap' 
};

const inputGroup = { 
    display: 'grid', 
    gridTemplateColumns: '1fr 1fr', 
    gap: '10px', 
    marginBottom: '10px' 
};

const inputGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'left',
  gap: '5px'
};

const inputStyle = { 
  padding: '10px', 
  borderRadius: '4px', 
  border: '2px solid #333', // Thick dark border
  backgroundColor: '#fff',
  color: '#000',
  width: '200px'
};

const buttonStyle = { 
  padding: '10px 20px', 
  backgroundColor: '#28a745', 
  color: 'white', 
  border: 'none', 
  borderRadius: '4px', 
  cursor: 'pointer',
  fontWeight: 'bold',
  height: '42px'
};

export default AddJobForm;
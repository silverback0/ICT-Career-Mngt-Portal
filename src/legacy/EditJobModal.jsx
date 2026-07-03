import React, { useState, useEffect } from 'react';
import { useJob } from '../context/JobContext';

export default function EditJobModal() {
  const { editingJob, updateJob, setEditingJob, deleteJob } = useJob();
  const [formData, setFormData] = useState(null);

  // Sync internal state with the job being edited
  useEffect(() => {
    if (editingJob) {
      setFormData({ 
        ...editingJob, 
        notes: editingJob.notes || '',
        status: editingJob.status || 'Backlog' // Ensure status is present
      });
    }
  }, [editingJob]);

  if (!editingJob || !formData) return null;

  const handleSave = (e) => {
    e.preventDefault();
    updateJob(formData);
    setEditingJob(null); // Close after saving
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this application?")) {
      deleteJob(formData.id);
      setEditingJob(null);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '1.2rem' }}>Manage Application</h2>
          <button onClick={() => setEditingJob(null)} style={closeBtn}>&times;</button>
        </div>

        <form onSubmit={handleSave}>
          {/* Status Selector - Key for Ministry Demo */}
          <label style={labelStyle}>Pipeline Status</label>
          <select 
            style={inputStyle}
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
          >
            <option value="Backlog">Backlog</option>
            <option value="Tailoring">Tailoring</option>
            <option value="Active">Active</option>
            <option value="In-Play">In-Play</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
            <option value="Ghosted/Archive">Ghosted/Archive</option>
          </select>

          <label style={labelStyle}>Position Title</label>
          <input 
            style={inputStyle} 
            value={formData.position} 
            onChange={(e) => setFormData({...formData, position: e.target.value})} 
          />

          <label style={labelStyle}>Company Name</label>
          <input 
            style={inputStyle} 
            value={formData.company} 
            onChange={(e) => setFormData({...formData, company: e.target.value})} 
          />

          <label style={labelStyle}>ICT Skills & Strategy Notes</label>
          <textarea 
            style={{ ...inputStyle, height: '100px', resize: 'none' }} 
            placeholder="e.g. Requires React, Python, or Ministry-specific certs..."
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
          />

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" style={saveBtnStyle}>Update Job</button>
            <button type="button" onClick={handleDelete} style={deleteBtnStyle}>Delete</button>
            <button type="button" onClick={() => setEditingJob(null)} style={cancelBtnStyle}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// STYLES
const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 };
const modalStyle = { backgroundColor: 'white', padding: '25px', borderRadius: '12px', width: '90%', maxWidth: '450px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' };
const labelStyle = { display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold', color: '#7f8c8d', textTransform: 'uppercase' };
const inputStyle = { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '14px' };
const saveBtnStyle = { flex: 2, padding: '12px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const deleteBtnStyle = { flex: 1, padding: '12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' };
const cancelBtnStyle = { flex: 1, padding: '12px', backgroundColor: '#ecf0f1', color: '#2c3e50', border: 'none', borderRadius: '6px', cursor: 'pointer' };
const closeBtn = { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#bdc3c7' };
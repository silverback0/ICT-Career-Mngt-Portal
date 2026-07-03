import React from 'react';
import { useJob } from '../context/JobContext';

export default function FilterBar() {
  const { filters, setFilters, counties, mdas, setSearchQuery } = useJob();

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div style={filterContainerStyle}>
      <input 
        type="text" 
        placeholder="Search by position or name..." 
        onChange={(e) => setSearchQuery(e.target.value)}
        style={inputStyle}
      />
      
      <select name="county" value={filters.county} onChange={handleFilterChange} style={selectStyle}>
        {counties.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      <select name="mda" value={filters.mda} onChange={handleFilterChange} style={selectStyle}>
        {mdas.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
    </div>
  );
}

// Simple styling
const filterContainerStyle = { display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' };
const inputStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #ddd', flex: '2', minWidth: '200px' };
const selectStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #ddd', flex: '1', backgroundColor: 'white' };
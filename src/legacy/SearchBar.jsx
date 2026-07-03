import React from 'react';
import { useJob } from '../context/JobContext.jsx';

export default function SearchBar() {
  const { searchQuery, setSearchQuery } = useJob();
    return (
    <div style={{ marginBottom: '20px', textAlign: 'center' }}>
      <input
        type="text"
        placeholder="Search jobs..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ padding: '10px', borderRadius: '4px', border: '2px solid #333', width: '300px' }}
      />
    </div>
  );
}   
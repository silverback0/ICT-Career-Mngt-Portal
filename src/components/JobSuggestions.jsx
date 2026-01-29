import React from 'react';
import { JobContext } from '../context/JobContext';

export default function JobSuggestions() {
    const [query, setQuery] = React.useState('');
    const [results, setResults] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [isRemoteOnly, setIsRemoteOnly] = React.useState(false);
    const [jobType, setJobType] = React.useState('ALL'); 
    const { addJobFromSearch } = React.useContext(JobContext);

    // 1. CLEAR SEARCH FUNCTION
    const clearSearch = () => {
        setResults([]);
        setQuery('');
    };

    const searchJobs = async () => {
    if (!query) return;
    setLoading(true);

    try {
        const apiKey = import.meta.env.VITE_RAPIDAPI_KEY;
        const apiHost = import.meta.env.VITE_RAPIDAPI_HOST;

        // DEBUG: Log the exact values
        console.log('Using API Key:', apiKey);
        console.log('Key length:', apiKey?.length);
        console.log('First 10 chars:', apiKey?.substring(0, 10));

        const searchQuery = isRemoteOnly ? query : `${query} in Kenya`;
        
        const params = new URLSearchParams({
            query: searchQuery,
            num_pages: '1'
        });
        
        if (isRemoteOnly) params.append('remote_jobs_only', 'true');
        if (jobType !== 'ALL') params.append('employment_types', jobType);

        const url = `https://jsearch.p.rapidapi.com/search?${params.toString()}`;
        
        console.log('Request URL:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': apiHost
            }
        });

        console.log('Response status:', response.status);

        if (response.status === 403) {
            alert('API key authentication failed. Check console for details.');
            return;
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            alert(`API Error (${response.status}): Check console`);
            return;
        }

        const data = await response.json();
        console.log('API Response:', data);
        setResults(data.data || []);
    } catch (error) {
        console.error('Fetch Error:', error);
        alert('Failed to fetch jobs. Check console for details.');
    } finally {
        setLoading(false);
    }
};

    return (
        <div style={containerStyle}>
            {/* HEADER SECTION */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0 }}>🚀 Job & Internship Finder</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {results.length > 0 && (
                        <button onClick={clearSearch} style={clearBtnStyle}>Clear Results</button>
                    )}
                    {loading && <span style={{ color: '#2ecc71', fontSize: '12px', fontWeight: 'bold' }}>Searching...</span>}
                </div>
            </div>
            
            {/* SEARCH CONTROLS */}
            <div style={searchBar}>
                <input 
                    type="text" 
                    placeholder="e.g. Frontend Developer" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={inputStyle}
                />

                <select value={jobType} onChange={(e) => setJobType(e.target.value)} style={selectStyle}>
                    <option value="ALL">All Types</option>
                    <option value="FULLTIME">Full-time</option>
                    <option value="INTERN">Internships</option>
                    <option value="CONTRACTOR">Contract</option>
                </select>
                
                <label style={checkboxStyle}>
                    <input type="checkbox" checked={isRemoteOnly} onChange={(e) => setIsRemoteOnly(e.target.checked)} />
                    Remote Only
                </label>

                <button onClick={searchJobs} disabled={loading} style={btnStyle}>
                    {loading ? 'Searching...' : 'Find Jobs'}
                </button>
            </div>

            {/* RESULTS GRID */}
            <div style={resultsGrid}>
                {results.length > 0 ? results.map((job, index) => (
                    <div key={job.job_id || index} style={cardStyle}>
                        <h4 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#2c3e50' }}>{job.job_title}</h4>
                        <p style={{ margin: '0', fontSize: '13px' }}><strong>{job.employer_name}</strong></p>
                        <p style={{ fontSize: '11px', color: '#666', margin: '5px 0' }}>
                            {job.job_is_remote ? '🏠 Remote' : `📍 ${job.job_city || 'Kenya'}`}
                        </p>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                            <a href={job.job_apply_link} target="_blank" rel="noreferrer" style={applyBtn}>
                                View Link
                            </a>
                            <button 
                                onClick={() => addJobFromSearch(job)} 
                                style={trackBtnSmall}
                            >
                                ➕ Track
                            </button>
                        </div>
                    </div>
                )) : !loading && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '20px', color: '#999' }}>
                        <p style={{ fontSize: '14px' }}>Enter a role and click "Find Jobs" to start sourcing.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- STYLES ---
const containerStyle = { padding: '20px', background: '#fff', borderRadius: '15px', border: '1px solid #eee', marginTop: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' };
const searchBar = { display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' };
const inputStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #ddd', flex: 2, minWidth: '200px' };
const selectStyle = { padding: '10px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: 'white', cursor: 'pointer' };
const checkboxStyle = { fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: '#555' };
const btnStyle = { padding: '10px 25px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const clearBtnStyle = { padding: '5px 12px', backgroundColor: '#f8f9fa', color: '#7f8c8d', border: '1px solid #ddd', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' };
const resultsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '15px' };
const cardStyle = { padding: '15px', background: '#fdfdfd', borderRadius: '10px', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.2s' };
const applyBtn = { textDecoration: 'none', color: '#3498db', fontSize: '12px', fontWeight: 'bold' };
const trackBtnSmall = { backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', padding: '6px 12px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' };
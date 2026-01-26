import React from 'react';
import { useJob } from '../context/JobContext.jsx';
import JobCard from '../components/JobCard.jsx';

const STATUSES = ['Backlog', 'Tailoring', 'Active', 'In-Play', 'Offer', 'Rejected', 'Ghosted/Archive'];

function Dashboard () {
    const { jobs, moveJob, deleteJob, searchQuery } = useJob();  
    const getJobsByStatus = (status) => {   
        return jobs
        .filter(job => job.status === status)
        .filter(job => 
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.position.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const handleDragOver = (e) => {
        e.preventDefault(); 
    };

    const handleDrop = (e, status) => {
        const jobId = e.dataTransfer.getData('jobId');
        moveJob(Number(jobId), status);
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px' }}>
            {STATUSES.map(status => (
                <div key={status}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, status)}
                    style={{ flex: 1, margin: '0 10px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', minHeight: '400px', backgroundColor: '#f9f9f9', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ textAlign: 'center' }}>{status}</h2>
                    {getJobsByStatus(status).map(job => (   
                        <div key={job.id}
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData('jobId', job.id)}        
                            >
                            <JobCard job={job} onDelete={deleteJob} />
                        </div>
                    ))}
                    {getJobsByStatus(status).length === 0 && (
                        <p style={{ color: '#888', fontStyle: 'italic' }}>Drag a job here or add a new one.</p>
                    )}
                </div>
            ))}
        </div>  
    );
}

export default Dashboard;
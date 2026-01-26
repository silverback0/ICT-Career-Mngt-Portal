import React from 'react';
import { useJob } from '../context/JobContext.jsx'; 

export default function Stats() {
    const { jobs } = useJob();

    // 1. Basic Metrics
    const total = jobs.length;
    const inPlayCount = jobs.filter(j => j.status === 'In-Play' || j.status === 'Interviewing').length;
    const offerCount = jobs.filter(j => j.status === 'Offer' || j.status === 'Final Offer').length;
    const interviewRate = total > 0 ? ((inPlayCount / total) * 100).toFixed(1) : "0.0";

    // 2. Weekly Goal Logic
    const WEEKLY_GOAL = 10; // You can change this number!
    
    // Filter jobs created in the last 7 days
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const jobsThisWeek = jobs.filter(j => {
        // We use the ID as a timestamp since we did Date.now().toString() in Context
        const jobDate = parseInt(j.id); 
        return jobDate > oneWeekAgo;
    }).length;

    const goalPercentage = Math.min((jobsThisWeek / WEEKLY_GOAL) * 100, 100);

    return (
        <div style={{ marginBottom: '40px' }}>
            <div style={containerStyle}>
                <div style={cardStyle}>
                    <span style={labelStyle}>Total Apps</span>
                    <p style={numberStyle}>{total}</p>
                </div>
                <div style={cardStyle}>
                    <span style={labelStyle}>In-Play</span>
                    <p style={{...numberStyle, color: '#3498db'}}>{inPlayCount}</p>
                </div>
                <div style={cardStyle}>
                    <span style={labelStyle}>Interview Rate</span>
                    <p style={numberStyle}>{interviewRate}%</p>
                </div>
                <div style={cardStyle}>
                    <span style={labelStyle}>Offers</span>
                    <p style={{...numberStyle, color: '#27ae60'}}>{offerCount}</p>
                </div>
            </div>

            {/* 🎯 WEEKLY GOAL PROGRESS BAR */}
            <div style={goalSectionStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#2c3e50' }}>
                        Weekly Goal Progress: {jobsThisWeek} / {WEEKLY_GOAL}
                    </span>
                    <span style={{ fontSize: '14px', color: '#7f8c8d' }}>{goalPercentage.toFixed(0)}%</span>
                </div>
                <div style={progressBarBg}>
                    <div style={{ ...progressBarFill, width: `${goalPercentage}%` }}></div>
                </div>
                <p style={{ fontSize: '12px', color: '#95a5a6', marginTop: '8px' }}>
                    {jobsThisWeek >= WEEKLY_GOAL 
                        ? "🎉 Weekly goal reached! Keep it up!" 
                        : `Apply for ${WEEKLY_GOAL - jobsThisWeek} more jobs to hit your target.`}
                </p>
            </div>
        </div>
    );
}

// STYLES
const containerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '20px',
    marginBottom: '20px'
};

const cardStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '16px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    textAlign: 'center',
    border: '1px solid #eee'
};

const labelStyle = { fontSize: '11px', color: '#7f8c8d', fontWeight: 'bold', textTransform: 'uppercase', display: 'block' };
const numberStyle = { fontSize: '28px', fontWeight: '800', color: '#2c3e50', margin: '5px 0 0 0' };

const goalSectionStyle = {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '16px',
    border: '1px solid #eee',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
};

const progressBarBg = {
    width: '100%',
    height: '12px',
    backgroundColor: '#ecf0f1',
    borderRadius: '10px',
    overflow: 'hidden'
};

const progressBarFill = {
    height: '100%',
    backgroundColor: '#3498db',
    borderRadius: '10px',
    transition: 'width 0.5s ease-in-out'
};
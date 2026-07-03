import React from 'react';
import { useJob } from '../context/JobContext.jsx'; 

// Replace your existing Stats function with this:
export default function Stats() {
    const { jobs } = useJob();

    const totalTalent = jobs.length;
    
    // Total Placements (Permanent roles)
    const permanentPlacements = jobs.filter(j => 
        j.status === 'Placed (Public)' || j.status === 'Placed (Private)'
    ).length;
    
    // Active Deployments (Interns/Staff currently in MDAs)
    const activeDeployments = jobs.filter(j => 
        j.status === 'MDA Rotation (Active)' || j.status === 'Deployment Ready'
    ).length;

    // Absorption Rate: Efficiency of moving talent from rotation to permanent roles
    const absorptionRate = totalTalent > 0 ? ((permanentPlacements / totalTalent) * 100).toFixed(1) : "0.0";

    return (
        <div style={{ marginBottom: '40px' }}>
            <div style={containerStyle}>
                <div style={cardStyle}>
                    <span style={labelStyle}>Total Talent Pool</span>
                    <p style={numberStyle}>{totalTalent}</p>
                </div>
                <div style={cardStyle}>
                    <span style={labelStyle}>Active MDA Deployments</span>
                    <p style={{...numberStyle, color: '#3498db'}}>{activeDeployments}</p>
                </div>
                <div style={cardStyle}>
                    <span style={labelStyle}>Absorption Rate</span>
                    <p style={numberStyle}>{absorptionRate}%</p>
                </div>
                <div style={cardStyle}>
                    <span style={labelStyle}>National Placements</span>
                    <p style={{...numberStyle, color: '#27ae60'}}>{permanentPlacements}</p>
                </div>
            </div>
            
            {/* Simple Legend for the Ministry */}
            <p style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '10px' }}>
                * Metrics reflect transitions from PDTP/Internship programs to permanent MDAs.
            </p>
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
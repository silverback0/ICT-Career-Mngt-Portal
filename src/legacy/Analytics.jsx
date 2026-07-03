import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Analytics({ jobs = [] }) {
  // Process data to count jobs per Agency/Ministry
  const dataMap = jobs.reduce((acc, job) => {
    const agency = job.company || 'Other';
    acc[agency] = (acc[agency] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(dataMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6); // Top 6 agencies

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
      <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <span>🏢</span> Talent Distribution by Agency
      </h3>
      
      {/* THE FIX: Explicit height container */}
      <div className="h-100 w-full"> 
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 40, right: 40 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={100} 
              style={{ fontSize: '12px', fontWeight: 'bold' }}
            />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
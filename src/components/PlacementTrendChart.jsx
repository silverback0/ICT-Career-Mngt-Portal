import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function PlacementTrendChart({ jobs }) {
  // Logic to process data for the chart
  const processData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const placementCounts = {};

    // Initialize months
    months.forEach(m => placementCounts[m] = 0);

    // Count placements per month (using a default if date is missing for demo)
    jobs.filter(j => j.status === "Placed (Public)").forEach(job => {
      const month = job.placedDate ? months[new Date(job.placedDate).getMonth()] : "Jan";
      placementCounts[month]++;
    });

    return months.map(month => ({ month, placements: placementCounts[month] }));
  };

  const chartData = processData();

  return (
    <div className="h-[250px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorPlacements" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#94a3b8', fontSize: 12}} 
          />
          <YAxis hide />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
          />
          <Area 
            type="monotone" 
            dataKey="placements" 
            stroke="#3b82f6" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorPlacements)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
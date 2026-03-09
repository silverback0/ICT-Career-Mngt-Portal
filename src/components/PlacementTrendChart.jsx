import React from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Area, 
  AreaChart 
} from 'recharts';

export default function PlacementTrendChart({ jobs = [] }) {
  const processData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const placementCounts = {};

    months.forEach(m => placementCounts[m] = 0);

    // Safely filter and count
    if (Array.isArray(jobs)) {
      jobs
        .filter(j => j?.status === "Placed (Public)")
        .forEach(job => {
          const monthIndex = job.placedDate ? new Date(job.placedDate).getMonth() : 0;
          const monthName = months[monthIndex];
          placementCounts[monthName]++;
        });
    }

    return months.map(month => ({ month, placements: placementCounts[month] }));
  };

  const chartData = processData();

  return (
    // FIX: Explicitly set a min-height for the parent container
    <div className="w-full" style={{ minHeight: 300 }}>
      <ResponsiveContainer width="100%" aspect={2} debounce={50}>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
            dy={10}
          />
          <YAxis hide domain={[0, 'auto']} />
          <Tooltip 
            cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="placements" 
            stroke="#3b82f6" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorPlacements)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
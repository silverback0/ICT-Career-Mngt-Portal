import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function SkillsGapChart({ data }) {
  // 1. Safety Guard: Prevents the .reduce or .map errors if data hasn't loaded
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="h-[300px] flex flex-col items-center justify-center text-slate-400 gap-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        <p className="text-sm italic font-medium">Analyzing skill demand...</p>
      </div>
    );
  }

  // 2. Transform the 'bySkill' object into an array and take the Top 5
  const chartData = Object.entries(data)
    .map(([name, value]) => ({ 
      name: name.length > 15 ? `${name.substring(0, 12)}...` : name, // Truncate long skill names
      fullName: name,
      value 
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // High-contrast professional palette
  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={70}
            outerRadius={90}
            paddingAngle={8}
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                stroke="none"
              />
            ))}
          </Pie>
          
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs">
                    <p className="font-bold mb-1">{payload[0].payload.fullName}</p>
                    <p className="text-blue-400">{payload[0].value} Open Positions</p>
                  </div>
                );
              }
              return null;
            }}
          />
          
          <Legend 
            verticalAlign="bottom" 
            align="center"
            iconType="circle"
            layout="horizontal"
            wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: '600' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
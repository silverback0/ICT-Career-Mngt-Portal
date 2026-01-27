import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function SkillsGapChart({ data }) {
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  
  // Get top 6 skills
  const chartData = Object.entries(data)
    .map(([skill, count]) => ({ name: skill, value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        🎯 Skills in Demand
      </h2>
      <p className="text-gray-600 text-sm mb-6">
        Most requested technical skills
      </p>
      
      {chartData.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Skills List */}
          <div className="mt-6 space-y-2">
            {chartData.map((skill, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-sm font-medium">{skill.name}</span>
                </div>
                <span className="text-sm text-gray-600">{skill.value} jobs</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500 py-12">
          No skills data available
        </div>
      )}
    </div>
  );
}
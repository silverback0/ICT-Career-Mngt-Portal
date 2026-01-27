import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function CountyHeatmap({ data }) {
  // Convert object to array for recharts
  const chartData = Object.entries(data)
    .map(([county, count]) => ({ county, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 counties
  
  // Color scale based on job count
  const getColor = (count) => {
    const max = Math.max(...chartData.map(d => d.count));
    const intensity = (count / max) * 255;
    return `rgb(${255 - intensity}, ${100 + intensity/2}, ${intensity})`;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        📍 Geographic Distribution
      </h2>
      <p className="text-gray-600 text-sm mb-6">
        ICT job openings by county
      </p>
      
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="county" 
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={getColor(entry.count)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center text-gray-500 py-12">
          No data available. Click "Refresh Data" to load jobs.
        </div>
      )}
      
      {/* Top 3 Counties */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {chartData.slice(0, 3).map((item, idx) => (
          <div key={idx} className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{item.count}</div>
            <div className="text-xs text-gray-600 mt-1">{item.county}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
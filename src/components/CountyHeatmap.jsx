import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { scaleQuantile } from "d3-scale";

// Ensure this file is in your /public folder
const geoUrl = "/kenya.geojson";

export default function CountyHeatmap({ data = {} }) {
  // 1. Data Processing
  const values = Object.values(data);
  const maxJobs = values.length > 0 ? Math.max(...values) : 10;
  
  const colorScale = scaleQuantile()
    .domain(values.length > 0 ? values : [0, 10])
    .range(["#f8fafc", "#dbeafe", "#93c5fd", "#3b82f6", "#1d4ed8"]);

  const [tooltip, setTooltip] = useState({ content: "", x: 0, y: 0 });

  return (
    <div className="bg-white rounded-xl p-6 w-full shadow-sm border border-slate-200">
      <header className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span>📍</span> National Talent Distribution
        </h2>
        <p className="text-slate-500 text-sm">ICT job density across the 47 counties</p>
      </header>

      {/* FIX: Explicit Height and Relative Position */}
      <div style={{ height: '500px', width: '100%', position: 'relative' }} className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
        
        {tooltip.content && (
          <div 
            className="pointer-events-none absolute z-50 bg-slate-900 text-white px-3 py-2 rounded-lg text-xs font-bold shadow-xl"
            style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -120%)' }}
          >
            {tooltip.content}
          </div>
        )}

        <div style={{ height: '500px', width: '100%', position: 'relative' }}>
        {/* TOOLTIP remains outside the flip container so the text isn't upside down! */}
        {tooltip.content && (
        <div className="absolute z-50 bg-slate-900 text-white px-2 py-1 rounded text-xs pointer-events-none"
         style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -120%)' }}>
      {tooltip.content}
      </div>
      )}

  {/* We wrap the map in a div that we FLIP using CSS */}
  <div style={{ width: '100%', height: '100%', transform: 'scaleY(-1)' }}>
    <ComposableMap
      projection="geoIdentity"
      style={{ width: "100%", height: "100%" }}
    >
      <ZoomableGroup 
        // Note: Because we flipped the container, 
        // the Latitude (0.5) must be NEGATIVE to be seen
        center={[37.8, -0.5]} 
        zoom={50}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const countyName = geo.properties.shapeName;
              const jobCount = data[countyName] || 0;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={jobCount > 0 ? colorScale(jobCount) : "#FFFFFF"}
                  stroke="#64748b"
                  strokeWidth={0.05}
                  onMouseMove={(e) => {
                    // We calculate tooltip position based on the parent
                    const bounds = e.currentTarget.closest('.bg-slate-50').getBoundingClientRect();
                    setTooltip({
                      content: `${countyName}: ${jobCount} Jobs`,
                      x: e.clientX - bounds.left,
                      y: e.clientY - bounds.top
                    });
                  }}
                  onMouseLeave={() => setTooltip({ content: "", x: 0, y: 0 })}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#1e293b", outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ZoomableGroup>
    </ComposableMap>
  </div>
</div>
      </div>

      <footer className="mt-6">
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-slate-600">0</span>
          <div className="flex-1 h-3 bg-gradient-to-r from-[#f8fafc] to-[#1d4ed8] rounded-full" />
          <span className="text-xs font-bold text-slate-600">{maxJobs}</span>
        </div>
      </footer>
    </div>
  );
}
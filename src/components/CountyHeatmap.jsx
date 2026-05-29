import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { scaleQuantile } from "d3-scale";

const geoUrl = "/kenya.geojson";

// Added 'onCountyClick' and 'selectedCounty' to props
export default function CountyHeatmap({ data = {}, onCountyClick, selectedCounty }) {
  const values = Object.values(data);
  const maxJobs = values.length > 0 ? Math.max(...values) : 10;
  
  // COLOR UPGRADE: Using a professional "Viridis" style palette 
  // (Light Gray -> Teal -> Deep Blue) for better contrast
  const colorScale = scaleQuantile()
    .domain(values.length > 0 ? values : [0, 10])
    .range(["#f1f5f9", "#99f6e4", "#2dd4bf", "#0d9488", "#115e59"]);

  const [tooltip, setTooltip] = useState({ content: "", x: 0, y: 0 });

  return (
    <div className="bg-white rounded-xl p-6 w-full shadow-sm border border-slate-200">
      <header className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>📍</span> National Talent Distribution
          </h2>
          <p className="text-slate-500 text-sm">Click a county to drill down into specifics</p>
        </div>
        {selectedCounty && selectedCounty !== "All" && (
          <span className="bg-teal-100 text-teal-700 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest border border-teal-200 animate-pulse">
            Viewing: {selectedCounty}
          </span>
        )}
      </header>

      <div style={{ height: '500px', width: '100%', position: 'relative' }} className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
        
        {tooltip.content && (
          <div 
            className="pointer-events-none absolute z-50 bg-slate-900 text-white px-3 py-2 rounded-lg text-xs font-bold shadow-xl border border-slate-700"
            style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -120%)' }}
          >
            {tooltip.content}
          </div>
        )}

        <div style={{ width: '100%', height: '100%', transform: 'scaleY(-1)' }}>
          <ComposableMap
            projection="geoIdentity"
            style={{ width: "100%", height: "100%" }}
          >
            <ZoomableGroup center={[37.8, -0.5]} zoom={50}>
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const countyName = geo.properties.shapeName;
                    const jobCount = data[countyName] || 0;
                    const isSelected = selectedCounty === countyName;

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        // DRILL DOWN LOGIC
                        onClick={() => onCountyClick && onCountyClick(countyName)}
                        
                        fill={isSelected ? "#f59e0b" : (jobCount > 0 ? colorScale(jobCount) : "#FFFFFF")}
                        stroke={isSelected ? "#b45309" : "#64748b"}
                        strokeWidth={isSelected ? 0.2 : 0.05}
                        
                        onMouseMove={(e) => {
                          const bounds = e.currentTarget.closest('.bg-slate-50').getBoundingClientRect();
                          setTooltip({
                            content: `${countyName}: ${jobCount} Candidates`,
                            x: e.clientX - bounds.left,
                            y: e.clientY - bounds.top
                          });
                        }}
                        onMouseLeave={() => setTooltip({ content: "", x: 0, y: 0 })}
                        style={{
                          default: { outline: "none", transition: "all 250ms" },
                          hover: { 
                            fill: isSelected ? "#f59e0b" : "#1e293b", 
                            outline: "none", 
                            cursor: "pointer" 
                          },
                          pressed: { fill: "#0f172a", outline: "none" },
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

      <footer className="mt-6">
        <div className="flex justify-between mb-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Low Density</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">High Density</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-2 bg-gradient-to-r from-[#f1f5f9] via-[#2dd4bf] to-[#115e59] rounded-full" />
        </div>
      </footer>
    </div>
  );
}
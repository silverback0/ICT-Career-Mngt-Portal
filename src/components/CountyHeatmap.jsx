import React, { useMemo, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from "react-simple-maps";
import { scaleQuantile } from "d3-scale";

// Updated Location of the Kenya.ge0json file from geoBoundaries
const geoUrl = "/kenya.geojson";

export default function CountyHeatmap({ data = {} }) {
  const colorScale = scaleQuantile()
    .domain(Object.values(data))
    .range([
      "#f8fafc", // Empty
      "#dbeafe", 
      "#93c5fd",
      "#3b82f6",
      "#1d4ed8",  // Highest density
    ]);

  return (
    <div className="bg-white rounded-xl p-6 w-full relative">
      <header className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span>📍</span> National Talent Distribution
        </h2>
        <p className="text-slate-500 text-sm">ICT job density across the 47 counties</p>
      </header>

      <div className="h-[500px] w-full bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden relative">
        {tooltip.content && (
          <div 
            className="pointer-events-none absolute z-50 bg-slate-900/95 text-white px-3 py-2 rounded-lg text-xs font-bold shadow-2xl"
            style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -120%)' }}
          >
            {tooltip.content}
          </div>
        )}

        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 2800, center: [37.8, 0.6] }}
          className="w-full h-full"
        >
          <Geographies geography={KENYA_GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const countyName = geo.properties.shapeName || geo.properties.NAME_1; 
                const jobCount = data[countyName] || 0;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={colorScale(jobCount)}
                    stroke="#ffffff"
                    strokeWidth={0.5}
                    onMouseMove={(e) => {
                      const bounds = e.currentTarget.parentElement.getBoundingClientRect();
                      setTooltip({
                        content: `${countyName}: ${jobCount} Jobs`,
                        x: e.clientX - bounds.left,
                        y: e.clientY - bounds.top
                      });
                    }}
                    onMouseLeave={() => setTooltip({ content: "", x: 0, y: 0 })}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#10b981", cursor: "pointer" },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
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
};


import React, { useMemo, useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';

const KENYA_GEO_URL = "https://raw.githubusercontent.com/deldersveld/topojson/master/countries/kenya/kenya-counties.json";

const CountyHeatmap = ({ data = {} }) => {
  // We store 'x' and 'y' to make the tooltip follow the mouse
  const [tooltip, setTooltip] = useState({ content: "", x: 0, y: 0 });

  const { maxJobs, colorScale } = useMemo(() => {
    const counts = Object.values(data);
    const max = counts.length > 0 ? Math.max(...counts) : 0;
    return {
      maxJobs: max,
      colorScale: scaleLinear()
        .domain([0, max || 1])
        .range(["#f8fafc", "#1d4ed8"]) // From slate-50 to deep blue
    };
  }, [data]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 w-full relative">
      <header className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span>📍</span> Geographic Distribution
        </h2>
        <p className="text-slate-500 text-sm">ICT job density across the 47 counties</p>
      </header>

      <div className="h-[500px] w-full bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden relative">
        
        {/* MOUSE-TRACKING TOOLTIP */}
        {tooltip.content && (
          <div 
            className="pointer-events-none absolute z-50 bg-slate-900/95 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-xs font-bold shadow-2xl border border-slate-700 whitespace-nowrap"
            style={{ 
              left: tooltip.x, 
              top: tooltip.y,
              transform: 'translate(-50%, -120%)', // Positions bubble above the cursor
              transition: 'left 0.1s ease-out, top 0.1s ease-out'
            }}
          >
            {tooltip.content}
            {/* Tooltip Arrow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-900/95" />
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
                const countyName = geo.properties.NAME_1; 
                const jobCount = data[countyName] || 0;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={colorScale(jobCount)}
                    stroke="#ffffff"
                    strokeWidth={0.5}
                    onMouseMove={(e) => {
                      // Calculate mouse position relative to this container
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
                      hover: { fill: "#10b981", outline: "none", cursor: "pointer" },
                      pressed: { fill: "#059669", outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>

      <footer className="mt-6">
        <div className="flex items-center justify-between mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>Low Density</span>
          <span>High Density</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-slate-600">0</span>
          <div className="flex-1 h-3 bg-gradient-to-r from-[#f8fafc] to-[#1d4ed8] rounded-full border border-slate-100 shadow-inner" />
          <span className="text-xs font-bold text-slate-600">{maxJobs}</span>
        </div>
      </footer>
    </div>
  );
};

export default CountyHeatmap;
import React, { useMemo, useState } from 'react';
import { DrillingEvent, CategoryStyle } from '../types';

interface WellDiagramProps {
  events: DrillingEvent[];
  selectedWells: string[];
  categoryMap: Record<string, CategoryStyle>;
  selectedCategories: string[];
}

const WellDiagram: React.FC<WellDiagramProps> = ({ 
  events, 
  selectedWells,
  categoryMap,
  selectedCategories
}) => {
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);

  // 1. Filter Data
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
        const wellMatch = selectedWells.includes(e.pozo);
        const catMatch = selectedCategories.length === 0 || selectedCategories.includes(e.subcategoria_npt);
        return wellMatch && catMatch;
    });
  }, [events, selectedWells, selectedCategories]);

  // 2. Determine Max Depth for Scale
  const maxDepth = useMemo(() => {
    // Default min depth of 3000m
    if (selectedWells.length === 0) return 3000;
    
    const relevantEvents = events.filter(e => selectedWells.includes(e.pozo));
    const absoluteMax = relevantEvents.length > 0 
        ? relevantEvents.reduce((acc, curr) => Math.max(acc, curr.prof_desde), 0)
        : 0;
    
    // Ensure we cover at least 3000m, or the max depth + padding
    return Math.max(3000, Math.ceil(absoluteMax * 1.05)); 
  }, [events, selectedWells]);

  // Generate dynamic Y-axis markers based on available height logic (percentage based)
  const depthMarkers = useMemo(() => {
    const markers = [];
    // Aim for roughly 10-12 ticks
    const roughStep = maxDepth / 10;
    // Round to nice number (100, 200, 250, 500)
    let step = 100;
    if (roughStep > 400) step = 500;
    else if (roughStep > 200) step = 250;
    else if (roughStep > 100) step = 200;

    for (let i = 0; i <= maxDepth; i += step) {
      markers.push(i);
    }
    return markers;
  }, [maxDepth]);

  if (selectedWells.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-900/50 m-4 rounded-xl animate-pulse">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-sm">
            <i className="fa-solid fa-arrow-up-right-from-square text-2xl text-slate-300 dark:text-slate-600"></i>
        </div>
        <p className="font-medium">Seleccione pozos para visualizar</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white dark:bg-slate-800 flex flex-col overflow-hidden transition-colors duration-300 relative select-none">
        
        {/* Header Row (Fixed Height) */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 h-12 flex-shrink-0 bg-slate-50 dark:bg-slate-900/50 relative z-20">
            {/* Y-Axis Header */}
            <div className="w-14 flex-shrink-0 border-r border-slate-200 dark:border-slate-700 flex items-center justify-center">
                <span className="text-[10px] font-bold text-slate-400">PROF</span>
            </div>
            {/* Well Headers */}
            {selectedWells.map((well) => {
                const wellCount = filteredEvents.filter(e => e.pozo === well).length;
                return (
                    <div key={well} className="flex-1 flex flex-col items-center justify-center border-r border-slate-100 dark:border-slate-700/50 last:border-0 px-1 overflow-hidden">
                        <div className="font-bold text-slate-700 dark:text-slate-200 text-xs truncate w-full text-center" title={well}>
                            {well}
                        </div>
                        <span className="text-[9px] text-slate-400 hidden sm:inline-block">{wellCount} evts</span>
                    </div>
                );
            })}
        </div>

        {/* Chart Area (Flex 1 to fill remaining height) */}
        {/* Changed overflow-hidden to overflow-visible to allow tooltips to extend outside chart area if needed */}
        <div className="flex-1 flex relative overflow-visible">
            
            {/* Grid Lines Layer (Behind) */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                 {depthMarkers.map((depth) => {
                     const pct = (depth / maxDepth) * 100;
                     if (pct > 100) return null;
                     return (
                        <div 
                            key={`grid-${depth}`} 
                            className="absolute w-full border-t border-dashed border-slate-100 dark:border-slate-700/50 flex items-center"
                            style={{ top: `${pct}%` }}
                        ></div>
                     );
                 })}
            </div>

            {/* Y-Axis Labels */}
            <div className="w-14 flex-shrink-0 border-r border-slate-200 dark:border-slate-700 relative h-full bg-slate-50/30 dark:bg-slate-900/10 z-10">
                {depthMarkers.map((depth) => {
                     const pct = (depth / maxDepth) * 100;
                     if (pct > 100) return null;
                     return (
                        <div 
                            key={`label-${depth}`} 
                            className="absolute right-1 text-[9px] font-mono text-slate-400 transform -translate-y-1/2"
                            style={{ top: `${pct}%` }}
                        >
                            {depth}
                        </div>
                     );
                 })}
            </div>

            {/* Wells Columns Container */}
            <div className="flex-1 flex h-full relative z-10">
                {selectedWells.map((well, colIndex) => {
                    const wellEvents = filteredEvents
                        .filter(e => e.pozo === well)
                        .sort((a, b) => a.prof_desde - b.prof_desde);
                    
                    // Logic to split screen in half: Left wells tooltip right, Right wells tooltip left
                    const isLeftSide = colIndex < selectedWells.length / 2;

                    return (
                        <div key={well} className="flex-1 relative border-r border-slate-100 dark:border-slate-700/30 last:border-0 h-full hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors group">
                             {/* Vertical Guide Line */}
                             <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-600"></div>

                             {/* Events */}
                             {wellEvents.map((event, evtIndex) => {
                                 const style = categoryMap[event.subcategoria_npt];
                                 const isHovered = hoveredEvent === event.id;
                                 
                                 // Percentage Position
                                 const topPct = (event.prof_desde / maxDepth) * 100;
                                 if (topPct > 100) return null;

                                 // Tooltip Logic
                                 // "Near Top" detection threshold increased slightly to handle large headers better
                                 const isNearTop = topPct < 20; 
                                 
                                 let tooltipXClasses = '';
                                 let arrowXClasses = '';
                                 let animationOrigin = '';

                                 // Arrow center (w-2/2 = 4px) needs to align with marker center. 
                                 // Arrow is positioned 'left-4' (16px) or 'right-4' (16px) inside tooltip.
                                 // Arrow Center = 16px + 4px = 20px from edge.
                                 // Marker is centered in column (left-1/2).
                                 // Tooltip needs to be offset so its Arrow Center aligns with Marker Center.
                                 // Offset needed = 20px (1.25rem = ml-5 or mr-5).

                                 if (isLeftSide) {
                                     // Align Tooltip to the Right of the marker
                                     // left-1/2: Tooltip Left Edge at Marker Center
                                     // -ml-5: Shift Tooltip Left by 20px so Arrow (at 20px) hits center
                                     tooltipXClasses = 'left-1/2 -ml-5'; 
                                     arrowXClasses = 'left-4';
                                     animationOrigin = isNearTop ? 'origin-top-left' : 'origin-bottom-left';
                                 } else {
                                     // Align Tooltip to the Left of the marker
                                     // right-1/2: Tooltip Right Edge at Marker Center
                                     // -mr-5: Shift Tooltip Right by 20px so Arrow (at 20px) hits center
                                     tooltipXClasses = 'right-1/2 -mr-5';
                                     arrowXClasses = 'right-4';
                                     animationOrigin = isNearTop ? 'origin-top-right' : 'origin-bottom-right';
                                 }

                                 return (
                                     <div
                                        key={event.id}
                                        className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                        style={{ top: `${topPct}%`, zIndex: isHovered ? 50 : 10 }}
                                        onMouseEnter={() => setHoveredEvent(event.id)}
                                        onMouseLeave={() => setHoveredEvent(null)}
                                     >
                                         {/* Marker Dot */}
                                         <div 
                                            className={`
                                                w-3 h-3 md:w-5 md:h-5 rounded-full border border-white dark:border-slate-800 shadow-sm flex items-center justify-center text-[6px] md:text-[8px] cursor-pointer transition-all duration-200
                                                ${isHovered ? 'scale-150 ring-2 ring-orange-400 z-50' : 'hover:scale-125'}
                                            `}
                                            style={{ backgroundColor: style?.color, color: 'white' }}
                                         >
                                            {isHovered && <i className={`fa-solid ${style?.iconClass || 'fa-circle'}`}></i>}
                                         </div>

                                         {/* Tooltip */}
                                         {isHovered && (
                                            <div 
                                                className={`
                                                    absolute w-64 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg shadow-xl border border-slate-200 dark:border-slate-600 z-[100] text-left pointer-events-none
                                                    ${tooltipXClasses}
                                                    ${animationOrigin}
                                                    ${isNearTop 
                                                        ? 'top-full mt-3 animate-in fade-in slide-in-from-top-2' 
                                                        : 'bottom-full mb-3 animate-in fade-in slide-in-from-bottom-2'
                                                    }
                                                `}
                                            >
                                                {/* Arrow */}
                                                <div 
                                                    className={`absolute w-2 h-2 bg-white dark:bg-slate-800 rotate-45 border-slate-200 dark:border-slate-600 ${arrowXClasses}
                                                    ${isNearTop ? '-top-1 border-t border-l' : '-bottom-1 border-b border-r'}`}
                                                ></div>

                                                <div className="relative z-10 p-3">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="font-bold text-xs text-slate-700 dark:text-slate-200">{event.pozo}</span>
                                                        <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono font-bold">{event.prof_desde}m</span>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: style?.color }}></div>
                                                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">{style?.label}</span>
                                                    </div>

                                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 italic leading-snug border-l-2 border-slate-200 dark:border-slate-600 pl-2 break-words">
                                                        {event.comentario}
                                                    </p>
                                                </div>
                                            </div>
                                         )}
                                     </div>
                                 );
                             })}
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
};

export default WellDiagram;
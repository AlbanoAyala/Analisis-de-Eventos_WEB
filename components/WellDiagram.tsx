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

  // 2. Determine Depth Scale
  const maxDepth = useMemo(() => {
    if (selectedWells.length === 0) return 3000;
    
    const relevantEvents = events.filter(e => selectedWells.includes(e.pozo));
    if (relevantEvents.length === 0) return 3000;
    
    const max = Math.max(...relevantEvents.map(e => e.prof_desde));
    return Math.max(3000, Math.ceil(max * 1.05)); 
  }, [events, selectedWells]);

  // Generate depth markers for Y-axis (Vertical)
  const depthMarkers = useMemo(() => {
    const markers = [];
    const step = 200; // Every 200 meters
    for (let i = 0; i <= maxDepth; i += step) {
      markers.push(i);
    }
    return markers;
  }, [maxDepth]);

  // Helper: Percentage from top
  const getTopPosition = (depth: number) => {
    return (depth / maxDepth) * 100;
  };

  if (selectedWells.length === 0) {
    return (
      <div className="flex items-center justify-center h-[500px] text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300 m-8">
        <div className="text-center">
            <i className="fa-solid fa-arrow-up-1-9 text-4xl mb-3 opacity-50"></i>
            <p className="font-medium">Seleccione al menos un pozo para ver el diagrama.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 overflow-hidden">
        
      {/* Diagram Container - Vertical Orientation */}
      <div className="relative min-h-[1200px] bg-white rounded-lg shadow-sm border border-slate-200 flex">
        
        {/* Y-Axis (Depth Labels) - Fixed Left */}
        <div className="w-16 flex-shrink-0 border-r border-slate-100 bg-slate-50 relative z-10">
             <div className="sticky top-0 p-2 text-[10px] font-bold text-slate-400 text-center border-b border-slate-200">
                PROF (m)
             </div>
             <div className="relative h-full w-full">
                {depthMarkers.map(depth => (
                     <div 
                        key={depth} 
                        className="absolute w-full flex items-center justify-end pr-2"
                        style={{ top: `${getTopPosition(depth)}%`, transform: 'translateY(-50%)' }}
                     >
                        <span className="text-[10px] font-mono text-slate-400">{depth}</span>
                        <div className="w-1.5 h-px bg-slate-300 ml-1"></div>
                     </div>
                 ))}
             </div>
        </div>

        {/* Wells Container - Horizontal Scroll if many wells */}
        <div className="flex-grow overflow-x-auto custom-scrollbar relative">
             
             {/* Background Grid Lines (Horizontal) */}
             <div className="absolute inset-0 z-0 pointer-events-none">
                {depthMarkers.map(depth => (
                     depth > 0 && (
                        <div 
                            key={depth}
                            className="absolute left-0 right-0 border-t border-dashed border-slate-100"
                            style={{ top: `${getTopPosition(depth)}%` }}
                        ></div>
                     )
                ))}
             </div>

             {/* Wells Flex Row */}
             <div className="flex h-full min-w-max px-4">
                {selectedWells.map(well => {
                    // Get all events for this specific well (sorted by depth for logic)
                    const wellEvents = filteredEvents
                        .filter(e => e.pozo === well)
                        .sort((a, b) => a.prof_desde - b.prof_desde);
                    
                    const wellTotalEvents = wellEvents.length;

                    return (
                        <div key={well} className="relative w-40 h-full flex flex-col group border-r border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                            {/* Well Header */}
                            <div className="h-12 border-b-2 border-slate-200 flex items-center justify-center bg-white z-10 group-hover:border-orange-400 transition-colors sticky top-0 shadow-sm">
                                <div className="flex flex-col items-center">
                                    <span className="font-bold text-slate-700 text-xs">{well}</span>
                                    <span className="text-[9px] text-slate-400">{wellTotalEvents} eventos</span>
                                </div>
                            </div>

                            {/* Well Line */}
                            <div className="flex-grow relative w-full">
                                {/* Vertical Well Bore Line */}
                                <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-slate-200 group-hover:bg-slate-300 transition-colors transform -translate-x-1/2"></div>

                                {/* Events */}
                                {wellEvents.map((event, index) => {
                                    const style = categoryMap[event.subcategoria_npt];
                                    const isHovered = hoveredEvent === event.id;
                                    
                                    // Mini-Summary Logic
                                    const nextEvent = wellEvents[index + 1];
                                    const progressPercent = Math.min(((event.prof_desde / maxDepth) * 100), 100);

                                    return (
                                        <div
                                            key={event.id}
                                            className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
                                            style={{ top: `${getTopPosition(event.prof_desde)}%` }}
                                            onMouseEnter={() => setHoveredEvent(event.id)}
                                            onMouseLeave={() => setHoveredEvent(null)}
                                        >
                                            {/* Marker */}
                                            <div 
                                                className={`
                                                    w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-[10px] cursor-pointer transition-all duration-300 relative z-20
                                                    ${isHovered ? 'scale-125 ring-4 ring-orange-200 z-50 bg-slate-800' : 'hover:scale-110'}
                                                `}
                                                style={{ backgroundColor: isHovered ? style?.color : style?.color, color: 'white' }}
                                            >
                                                <i className={`fa-solid ${style?.iconClass || 'fa-circle'}`}></i>
                                            </div>
                                            
                                            {/* Simple Depth Label (Always visible on hover next to dot) */}
                                            {isHovered && (
                                                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded font-mono opacity-90 whitespace-nowrap z-50 shadow-lg">
                                                    {event.prof_desde}m
                                                </div>
                                            )}

                                            {/* ENHANCED TOOLTIP */}
                                            {isHovered && (
                                                <div className="absolute left-1/2 bottom-full mb-4 transform -translate-x-1/2 w-72 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden text-left transition-all duration-300 ease-out origin-bottom animate-in slide-in-from-bottom-2 fade-in">
                                                    
                                                    {/* Header */}
                                                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                                                        <div>
                                                            <div className="font-bold text-slate-700 text-sm">{event.pozo}</div>
                                                            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Evento #{index + 1} de {wellTotalEvents}</div>
                                                        </div>
                                                        <span className="bg-slate-800 text-white px-2 py-1 rounded-md text-xs font-mono font-bold">
                                                            {event.prof_desde}m
                                                        </span>
                                                    </div>

                                                    {/* Body */}
                                                    <div className="p-4">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-inner" style={{ background: style?.color }}>
                                                                <i className={`fa-solid ${style?.iconClass}`}></i>
                                                            </div>
                                                            <div>
                                                                <div className="text-[10px] text-slate-400 uppercase">Categoría</div>
                                                                <span className="font-bold text-sm leading-tight block" style={{ color: style?.color }}>
                                                                    {style?.label}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <p className="text-slate-600 text-xs leading-relaxed bg-slate-50 p-2 rounded border border-slate-100 italic">
                                                            "{event.comentario}"
                                                        </p>
                                                    </div>

                                                    {/* Footer / Mini Summary */}
                                                    <div className="bg-slate-100 px-4 py-3 border-t border-slate-200">
                                                        
                                                        {/* Progress Bar */}
                                                        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                                                            <span>Progreso del pozo</span>
                                                            <span>{Math.round(progressPercent)}%</span>
                                                        </div>
                                                        <div className="w-full bg-slate-200 rounded-full h-1.5 mb-3 overflow-hidden">
                                                            <div 
                                                                className="bg-orange-500 h-1.5 rounded-full" 
                                                                style={{ width: `${progressPercent}%` }}
                                                            ></div>
                                                        </div>

                                                        {/* Next Event Context */}
                                                        {nextEvent ? (
                                                            <div className="flex items-start gap-2 text-[10px]">
                                                                <i className="fa-solid fa-arrow-down text-slate-400 mt-0.5"></i>
                                                                <div>
                                                                    <span className="text-slate-400">Siguiente: </span>
                                                                    <span className="font-semibold text-slate-600">{nextEvent.subcategoria_npt}</span>
                                                                    <span className="text-slate-400"> a {nextEvent.prof_desde}m</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2 text-[10px] text-green-600 font-medium">
                                                                <i className="fa-solid fa-flag-checkered"></i>
                                                                <span>Último evento registrado</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
             </div>
        </div>
      </div>
    </div>
  );
};

export default WellDiagram;
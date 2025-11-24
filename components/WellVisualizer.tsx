import React, { useMemo, useState, useRef, useEffect } from 'react';
import { WellData } from '../types';
import { 
  BrainCircuit, 
  X, 
  Star, 
  Diamond, 
  Square, 
  Wrench, 
  Settings,
  Circle, 
  TrendingDown,
  ZoomIn,
  ZoomOut,
  Maximize,
  Move
} from 'lucide-react';
import { analyzeWellEvents } from '../services/geminiService';
import { GeminiAnalysisResult } from '../types';

interface WellVisualizerProps {
  selectedWells: WellData[];
}

interface EventStyle {
  Icon: React.ElementType;
  colorClass: string;
  label: string;
}

// MAPPING LOGIC based on User's List
const getEventConfig = (subcategoryRaw: string): EventStyle => {
  const lower = (subcategoryRaw || '').toLowerCase().trim();
  
  // 1. PÉRDIDAS
  if (lower.includes('pérdida') || lower.includes('perdida') || lower.includes('fuga') || lower.includes('admisibilidad')) {
    return { Icon: Star, colorClass: 'text-red-500', label: 'Pérdida de Circulación' };
  }
  
  // 2. KICKS / GAS / CONTROL
  if (lower.includes('control') || lower.includes('kick') || lower.includes('influjo') || lower.includes('brota') || lower.includes('gas')) {
    return { Icon: Diamond, colorClass: 'text-yellow-400', label: 'Influjo / Gas / Control' };
  }

  // 3. MECHANICAL STICKING / HOLE ISSUES
  if (
    lower.includes('pegadura') || lower.includes('pega') || 
    lower.includes('empaquetamiento') || lower.includes('embolamiento') || 
    lower.includes('hueco apretado') || lower.includes('stuck') || 
    lower.includes('atrapamiento') || lower.includes('colapso') ||
    lower.includes('arrastre')
  ) {
    return { Icon: Square, colorClass: 'text-orange-500', label: 'Pegadura / Estado del Hueco' };
  }

  // 4. FALLA DE EQUIPO
  if (lower.includes('falla') || lower.includes('equipo') || lower.includes('rotura') || lower.includes('reparacion')) {
    return { Icon: Wrench, colorClass: 'text-slate-400', label: 'Falla de Equipo' };
  }

  // 5. OPERATIONAL / LOGISTICS / CHANGES
  if (
    lower.includes('set up') || lower.includes('setup') || 
    lower.includes('cambio') || lower.includes('maniobra') || 
    lower.includes('baja') || lower.includes('saca') || 
    lower.includes('logística') || lower.includes('espera') ||
    lower.includes('viaje') || lower.includes('circula')
  ) {
    return { Icon: Settings, colorClass: 'text-blue-400', label: 'Maniobras / Set Up / Logística' };
  }

  // 6. PERFORMANCE / PARAMETERS
  if (lower.includes('rop') || lower.includes('parametro') || lower.includes('perforacion')) {
    return { Icon: TrendingDown, colorClass: 'text-green-400', label: 'ROP / Parámetros' };
  }

   // Default
  return { Icon: Circle, colorClass: 'text-slate-500', label: 'Otros Eventos' };
};

export const WellVisualizer: React.FC<WellVisualizerProps> = ({ selectedWells }) => {
  const [analyzingWell, setAnalyzingWell] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<Record<string, GeminiAnalysisResult>>({});
  const [showAnalysisModal, setShowAnalysisModal] = useState<string | null>(null);

  // ZOOM & PAN STATE
  const [zoomLevel, setZoomLevel] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  // Calculate global max depth for scaling, minimum 3000m as requested
  const globalMaxDepth = useMemo(() => {
    const dataMax = selectedWells.length > 0 
      ? Math.max(...selectedWells.map(w => w.maxDepth)) 
      : 0;
    return Math.max(dataMax, 3000);
  }, [selectedWells]);

  // Generate Dynamic Legend Items based on current data
  const activeLegendItems = useMemo(() => {
    const uniqueLabels = new Set<string>();
    const items: EventStyle[] = [];

    selectedWells.forEach(well => {
      well.events.forEach(evt => {
        const config = getEventConfig(evt.subcategoria_npt);
        if (!uniqueLabels.has(config.label)) {
          uniqueLabels.add(config.label);
          items.push(config);
        }
      });
    });

    const order = ['Pérdida', 'Influjo', 'Pegadura', 'Falla', 'Maniobras', 'ROP', 'Otros'];
    return items.sort((a, b) => {
      const idxA = order.findIndex(k => a.label.includes(k));
      const idxB = order.findIndex(k => b.label.includes(k));
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });
  }, [selectedWells]);

  // DYNAMIC AXIS CALCULATION
  // Based on zoom level, determine the interval for ticks
  const axisTicks = useMemo(() => {
    // Base visual height is roughly the viewport height.
    // When zoomed in (e.g. 2x), the virtual height is 2x.
    // We want a tick roughly every 50-100px visually.
    const totalVirtualHeight = 800 * zoomLevel; // Approx base height 800px
    const desiredTicks = Math.floor(totalVirtualHeight / 100); 
    
    // Calculate a nice round interval (e.g., 100, 250, 500, 1000)
    const rawInterval = globalMaxDepth / desiredTicks;
    
    // Round to nearest nice number
    const steps = [50, 100, 200, 250, 500, 1000, 2000, 3000];
    const interval = steps.find(s => s >= rawInterval) || 3000;
    
    const ticks = [];
    for (let d = 0; d <= globalMaxDepth; d += interval) {
      ticks.push(d);
    }
    return ticks;
  }, [globalMaxDepth, zoomLevel]);

  const handleAnalyze = async (well: WellData) => {
    setAnalyzingWell(well.name);
    try {
      const result = await analyzeWellEvents(well.name, well.events);
      setAnalysisResult(prev => ({ ...prev, [well.name]: result }));
      setShowAnalysisModal(well.name);
    } finally {
      setAnalyzingWell(null);
    }
  };

  // ZOOM HANDLERS
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.5, 10));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.5, 1));
  const handleResetZoom = () => setZoomLevel(1);

  // PAN HANDLERS
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartPan({
      x: e.pageX,
      y: e.pageY,
      scrollLeft: scrollContainerRef.current.scrollLeft,
      scrollTop: scrollContainerRef.current.scrollTop
    });
    scrollContainerRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - startPan.x;
    const y = e.pageY - startPan.y;
    scrollContainerRef.current.scrollLeft = startPan.scrollLeft - x;
    scrollContainerRef.current.scrollTop = startPan.scrollTop - y;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab';
    }
  };

  if (selectedWells.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        Selecciona pozos en el menú superior para visualizar
      </div>
    );
  }

  return (
    <div className="flex h-full relative bg-slate-950 overflow-hidden">
      
      {/* LEFT SIDEBAR: LEGEND */}
      <div className="flex-shrink-0 w-64 border-r border-slate-800 flex flex-col bg-slate-900/50 z-30 backdrop-blur-sm">
        <div className="p-4 border-b border-slate-800 bg-slate-900/80">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Referencias</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeLegendItems.length > 0 ? activeLegendItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 group">
              <div className={`p-2 rounded-lg bg-slate-800 border border-slate-700 group-hover:border-slate-500 transition-colors`}>
                <item.Icon size={18} className={item.colorClass} />
              </div>
              <span className="text-sm text-slate-300 font-medium leading-tight">{item.label}</span>
            </div>
          )) : (
            <div className="text-xs text-slate-600 italic">No hay eventos para mostrar en la selección actual.</div>
          )}
        </div>
        <div className="p-4 border-t border-slate-800 text-[10px] text-slate-600 text-center">
          Escala: 0m - {globalMaxDepth}m
        </div>
      </div>

      {/* MAIN CHART AREA */}
      <div className="flex-1 flex flex-col relative h-full overflow-hidden bg-slate-950">
        
        {/* ZOOM CONTROLS */}
        <div className="absolute top-4 right-4 z-50 flex flex-col gap-2 bg-slate-900/90 p-2 rounded-lg border border-slate-700 shadow-xl backdrop-blur-md">
          <button onClick={handleZoomIn} className="p-2 hover:bg-slate-700 rounded text-blue-400" title="Acercar">
            <ZoomIn size={20} />
          </button>
          <button onClick={handleZoomOut} className="p-2 hover:bg-slate-700 rounded text-slate-400" title="Alejar">
            <ZoomOut size={20} />
          </button>
          <div className="h-px bg-slate-700 my-1"></div>
          <button onClick={handleResetZoom} className="p-2 hover:bg-slate-700 rounded text-slate-400" title="Restablecer">
            <Maximize size={20} />
          </button>
          <div className="h-px bg-slate-700 my-1"></div>
          <div className="p-2 text-slate-500 flex justify-center" title="Arrastrar para mover">
            <Move size={16} />
          </div>
        </div>

        {/* SCROLLABLE VIEWPORT */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-auto custom-scrollbar relative cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div 
            className="flex relative min-w-max transition-all duration-300 ease-out"
            style={{ height: `${zoomLevel * 100}%`, minHeight: '100%' }}
          >
            
            {/* Y-Axis (Depth) - Sticky Left */}
            <div className="sticky left-0 w-14 bg-slate-950/95 border-r border-slate-800 z-20 h-full flex flex-col pointer-events-none backdrop-blur-sm">
               {axisTicks.map((depth) => {
                 const topPos = (depth / globalMaxDepth) * 100;
                 return (
                    <div key={depth} className="absolute w-full border-b border-slate-800/50 flex justify-end pr-2 text-[10px] text-slate-500 font-mono group" 
                         style={{ top: `${topPos}%`, transform: 'translateY(-50%)' }}>
                      <span className="group-hover:text-slate-300 transition-colors">{depth}</span>
                    </div>
                 );
               })}
            </div>

            {/* Grid Lines Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              {axisTicks.map((depth) => {
                const topPos = (depth / globalMaxDepth) * 100;
                return (
                   <div key={depth} className="absolute w-full border-b border-slate-800/20" style={{ top: `${topPos}%` }}></div>
                );
              })}
            </div>

            {/* Wells Columns */}
            {selectedWells.map((well) => (
              <div key={well.name} className="w-48 min-w-[192px] h-full border-r border-slate-800/50 relative group/well">
                
                {/* Well Header (Sticky Top) */}
                <div className="sticky top-0 h-14 flex items-center justify-between px-3 border-b border-slate-700 bg-slate-900 z-30 shadow-lg">
                   <div className="flex flex-col overflow-hidden">
                     <span className="text-[10px] text-slate-500 font-bold">POZO</span>
                     <span className="font-bold text-slate-100 truncate text-sm" title={well.name}>{well.name}</span>
                   </div>
                   <button 
                      onClick={(e) => { e.stopPropagation(); handleAnalyze(well); }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-md bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 transition-colors"
                      title="Analizar Eventos"
                   >
                     {analyzingWell === well.name ? <div className="animate-spin w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full" /> : <BrainCircuit size={16} />}
                   </button>
                </div>

                {/* Well String Visualization */}
                <div className="absolute top-14 bottom-0 left-0 right-0">
                  
                  {/* Central String Line */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-slate-700 -translate-x-1/2"></div>

                  {/* Surface Marker */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full flex justify-center z-10">
                    <div className="h-[2px] w-16 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
                  </div>

                  {/* Events */}
                  {well.events.map((event) => {
                    const depth = event.prof_desde || 0;
                    const topPos = (depth / globalMaxDepth) * 100;
                    
                    // Safety check to prevent markers flying off chart
                    if (topPos < 0 || topPos > 100) return null;

                    const config = getEventConfig(event.subcategoria_npt);

                    return (
                      <div 
                        key={event.id} 
                        className="absolute left-1/2 w-full -translate-x-1/2 z-10 flex justify-center pointer-events-none"
                        style={{ top: `${topPos}%` }}
                      >
                        {/* Marker */}
                        <div 
                           className="relative -translate-y-1/2 cursor-pointer group/marker pointer-events-auto hover:scale-125 hover:z-50 transition-all duration-200"
                           onMouseDown={(e) => e.stopPropagation()} // Prevent drag start on marker
                        >
                          {/* Icon */}
                          <config.Icon 
                            size={22} 
                            className={`${config.colorClass} drop-shadow-lg bg-slate-950 rounded-full p-[1px]`}
                            fill="currentColor"
                            fillOpacity={0.2}
                          />

                          {/* Detailed Tooltip */}
                          <div className="absolute left-6 top-1/2 -translate-y-1/2 w-64 opacity-0 group-hover/marker:opacity-100 pointer-events-none transition-opacity duration-200 z-50 pl-3">
                            <div className="bg-slate-800 border border-slate-600 rounded-xl shadow-2xl p-3 backdrop-blur-xl">
                               <div className="flex items-center gap-2 border-b border-slate-700 pb-2 mb-2">
                                  <span className={`font-bold text-xs px-2 py-0.5 rounded bg-slate-900 ${config.colorClass}`}>
                                    {depth} m
                                  </span>
                                  <span className="text-[10px] text-slate-400 uppercase ml-auto">
                                    {event.subcategoria_npt}
                                  </span>
                               </div>
                               <p className="text-xs text-slate-300 leading-relaxed">
                                 {event.comentario || event.subcategoria_npt}
                                </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analysis Modal */}
      {showAnalysisModal && analysisResult[showAnalysisModal] && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950 rounded-t-2xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <BrainCircuit className="text-purple-500" size={24} />
                Análisis IA: {showAnalysisModal}
              </h3>
              <button onClick={() => setShowAnalysisModal(null)} className="text-slate-400 hover:text-white"><X size={24} /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <h4 className="text-blue-400 font-bold mb-2 text-sm uppercase">Resumen</h4>
                <p className="text-slate-300 text-sm">{analysisResult[showAnalysisModal].summary}</p>
              </div>
              <div>
                 <h4 className="text-green-400 font-bold mb-3 text-sm uppercase">Recomendaciones</h4>
                 <ul className="space-y-3">
                   {analysisResult[showAnalysisModal].recommendations.map((rec, i) => (
                     <li key={i} className="flex gap-3 text-sm text-slate-300 bg-slate-900/50 p-3 rounded-lg">
                       <span className="font-bold text-slate-500">{i+1}.</span>
                       {rec}
                     </li>
                   ))}
                 </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

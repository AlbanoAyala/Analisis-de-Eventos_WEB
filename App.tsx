import React, { useState, useMemo } from 'react';
import { FileUpload } from './components/FileUpload';
import { WellVisualizer } from './components/WellVisualizer';
import { EventTable } from './components/EventTable';
import { parseExcelFile } from './utils/excelParser';
import { DrillingEvent, WellData, ViewMode } from './types';
import { BarChart2, Table as TableIcon, Database, ChevronDown, Filter } from 'lucide-react';

const App: React.FC = () => {
  const [events, setEvents] = useState<DrillingEvent[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('visualizer');
  const [isLoading, setIsLoading] = useState(false);
  
  const allWells = useMemo(() => {
    const wells = Array.from(new Set(events.map(e => e.pozo)));
    return wells.sort();
  }, [events]);

  const [selectedWellNames, setSelectedWellNames] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const wellsData: WellData[] = useMemo(() => {
    return selectedWellNames.map(name => {
      const wellEvents = events.filter(e => e.pozo === name);
      const depths = wellEvents.map(e => e.prof_desde).filter(d => typeof d === 'number' && !isNaN(d));
      // User request: default scale up to 3000m, or deeper if data exists
      const maxDataDepth = depths.length > 0 ? Math.max(...depths) : 0;
      const maxDepth = Math.max(maxDataDepth * 1.05, 3000); 
      
      return {
        name,
        maxDepth: Math.round(maxDepth),
        events: wellEvents
      };
    });
  }, [selectedWellNames, events]);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const parsedEvents = await parseExcelFile(file);
      if (parsedEvents.length === 0) {
        alert("No se encontraron eventos válidos. Verifique las columnas: Pozo, Profundidad (prof_desde), Subcategoría (subcategoria_npt).");
        return;
      }
      setEvents(parsedEvents);
      const uniqueWells = Array.from(new Set(parsedEvents.map(e => e.pozo))).sort();
      setSelectedWellNames(uniqueWells.slice(0, 5));
    } catch (error) {
      console.error("Error parsing file:", error);
      alert("Error al procesar el archivo. Asegúrese de que sea un Excel válido.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWellSelection = (wellName: string) => {
    setSelectedWellNames(prev => 
      prev.includes(wellName) 
        ? prev.filter(n => n !== wellName)
        : [...prev, wellName]
    );
  };

  return (
    <div className="h-screen flex flex-col font-sans bg-slate-950 text-slate-200 selection:bg-blue-500/30 overflow-hidden">
      {/* Header */}
      <header className="h-14 shrink-0 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-4 shadow-lg z-50">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center shadow shadow-blue-500/20">
            <Database size={16} className="text-white" />
          </div>
          <h1 className="text-lg font-bold text-slate-100">
            DrillVisio AI
          </h1>
        </div>

        {events.length > 0 && (
          <div className="flex items-center gap-4">
            {/* Well Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-xs font-medium transition-all text-slate-200"
              >
                <Filter size={14} className="text-blue-400" />
                <span>Seleccionar Pozos ({selectedWellNames.length})</span>
                <ChevronDown size={12} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 max-h-80 overflow-y-auto bg-slate-900 border border-slate-700 rounded shadow-2xl z-50 custom-scrollbar">
                  <div className="sticky top-0 bg-slate-900 p-2 border-b border-slate-800 text-[10px] text-slate-500 font-bold uppercase">
                    Disponible ({allWells.length})
                  </div>
                  {allWells.map(well => (
                    <label key={well} className="flex items-center gap-3 px-3 py-2 hover:bg-slate-800 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={selectedWellNames.includes(well)}
                        onChange={() => toggleWellSelection(well)}
                        className="rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-0"
                      />
                      <span className="text-sm text-slate-300 truncate">{well}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex bg-slate-800 rounded p-0.5 border border-slate-700">
              <button
                onClick={() => setViewMode('visualizer')}
                className={`px-3 py-1 rounded flex items-center gap-1.5 text-xs font-medium transition-all ${
                  viewMode === 'visualizer' 
                    ? 'bg-slate-700 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BarChart2 size={14} />
                Visualizador
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded flex items-center gap-1.5 text-xs font-medium transition-all ${
                  viewMode === 'table' 
                    ? 'bg-slate-700 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <TableIcon size={14} />
                Tabla
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        {events.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center px-4 pb-20">
             <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />
          </div>
        ) : (
          <div className="h-full w-full">
            {viewMode === 'visualizer' ? (
              <WellVisualizer selectedWells={wellsData} />
            ) : (
              <div className="p-6 h-full overflow-hidden">
                 <div className="h-full bg-slate-900 border border-slate-800 rounded-xl overflow-y-auto custom-scrollbar">
                   <EventTable selectedWells={wellsData} />
                 </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;

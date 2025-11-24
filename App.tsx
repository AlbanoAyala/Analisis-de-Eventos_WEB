import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import WellDiagram from './components/WellDiagram';
import SummaryTable from './components/SummaryTable';
import Sidebar from './components/Sidebar';
import { DrillingEvent, ViewMode, CategoryStyle } from './types';
import { MOCK_DATA, DYNAMIC_PALETTE } from './constants';
import { parseExcelFile } from './services/excelService';

const App: React.FC = () => {
  const [events, setEvents] = useState<DrillingEvent[]>(MOCK_DATA);
  
  // Initialize selectedWells from MOCK_DATA
  const [selectedWells, setSelectedWells] = useState<string[]>(() => {
    return Array.from(new Set(MOCK_DATA.map(e => e.pozo))).sort();
  });
  
  // Selected Categories for Filtering
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const [viewMode, setViewMode] = useState<ViewMode>('chart');
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Available Wells
  const availableWells = useMemo(() => {
    return Array.from(new Set(events.map(e => e.pozo))).sort();
  }, [events]);

  // 2. Centralized Category Mapping Logic
  // This ensures Sidebar, Diagram, and Table all use the exact same colors
  const categoryMap = useMemo(() => {
    const uniqueCategories = Array.from(new Set(events.map(e => e.subcategoria_npt))).sort();
    const map: Record<string, CategoryStyle> = {};
    
    uniqueCategories.forEach((cat, index) => {
      const style = DYNAMIC_PALETTE[index % DYNAMIC_PALETTE.length];
      map[cat] = {
        label: cat,
        color: style.color,
        iconClass: style.iconClass
      };
    });
    return map;
  }, [events]);

  // Handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const parsedEvents = await parseExcelFile(file);
      setEvents(parsedEvents);
      
      const newWells = Array.from(new Set(parsedEvents.map(e => e.pozo))).sort();
      setSelectedWells(newWells);
      setSelectedCategories([]); // Reset category filters on new file
      
      setViewMode('chart');
    } catch (error) {
      alert("Error al procesar. Formato requerido: pozo, prof_desde, subcategoria_npt, comentario");
      console.error(error);
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  const toggleWell = (well: string) => {
    setSelectedWells(prev => 
      prev.includes(well) ? prev.filter(w => w !== well) : [...prev, well]
    );
  };

  // Support filtering the "Select All" based on the user's search in FilterBar
  const handleSelectAll = (visibleWells?: string[]) => {
    if (visibleWells && visibleWells.length > 0) {
        // If a search filter is active, only add the visible ones
        const newSelection = new Set([...selectedWells, ...visibleWells]);
        setSelectedWells(Array.from(newSelection).sort());
    } else {
        // Otherwise select absolutely everything
        setSelectedWells(availableWells);
    }
  };

  const handleSelectNone = () => {
    setSelectedWells([]);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
        prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const clearCategories = () => {
    setSelectedCategories([]);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      <Header />
      
      <FilterBar 
        availableWells={availableWells}
        selectedWells={selectedWells}
        onToggleWell={toggleWell}
        onSelectAll={handleSelectAll}
        onSelectNone={handleSelectNone}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onFileUpload={handleFileUpload}
        isProcessing={isProcessing}
      />

      {/* Main Layout: Sidebar Left, Content Right */}
      <div className="flex flex-col lg:flex-row max-w-[1920px] mx-auto w-full">
        
        {/* Left Sidebar (Legend & Filter) */}
        <Sidebar 
            categoryMap={categoryMap}
            selectedCategories={selectedCategories}
            onToggleCategory={toggleCategory}
            onClearCategories={clearCategories}
        />

        {/* Right Content */}
        <main className="flex-grow w-full min-w-0 bg-slate-100 p-4 lg:p-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[600px]">
                {viewMode === 'chart' ? (
                    <div className="h-full">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-800 border-l-4 border-orange-500 pl-3">
                                Diagrama Vertical
                            </h2>
                            {selectedCategories.length > 0 && (
                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                                    Filtro de Categoría Activo ({selectedCategories.length})
                                </span>
                            )}
                        </div>
                        <WellDiagram 
                            events={events} 
                            selectedWells={selectedWells} 
                            categoryMap={categoryMap}
                            selectedCategories={selectedCategories}
                        />
                    </div>
                ) : (
                    <div className="h-full">
                         <div className="px-6 py-4 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800 border-l-4 border-orange-500 pl-3">
                                Tabla de Eventos
                            </h2>
                        </div>
                        <div className="p-4">
                            <SummaryTable 
                                events={events} 
                                selectedWells={selectedWells} 
                            />
                        </div>
                    </div>
                )}
            </div>
        </main>

      </div>
    </div>
  );
};

export default App;
import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import WellDiagram from './components/WellDiagram';
import SummaryTable from './components/SummaryTable';
import Sidebar from './components/Sidebar';
import AddEventModal from './components/AddEventModal';
import { DrillingEvent, ViewMode, CategoryStyle } from './types';
import { DYNAMIC_PALETTE, MOCK_DATA } from './constants';
import { fetchDrillingEvents, createDrillingEvent } from './services/supabaseClient';

const App: React.FC = () => {
  const [events, setEvents] = useState<DrillingEvent[]>([]);
  const [isLoadingDB, setIsLoadingDB] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Selected Wells
  const [selectedWells, setSelectedWells] = useState<string[]>([]);
  
  // Selected Categories for Filtering
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const [viewMode, setViewMode] = useState<ViewMode>('chart');
  const [isProcessing, setIsProcessing] = useState(false);

  // Load Data from Supabase on Mount
  useEffect(() => {
    loadDataFromSupabase();
  }, []);

  const loadDataFromSupabase = async () => {
    setIsLoadingDB(true);
    try {
      const dbEvents = await fetchDrillingEvents();
      if (dbEvents.length > 0) {
        setEvents(dbEvents);
        const newWells = Array.from(new Set(dbEvents.map(e => e.pozo))).sort();
        setSelectedWells(prev => prev.length > 0 ? prev : newWells);
      } else {
        console.log("Database empty, loading mocks");
        setEvents(MOCK_DATA);
        const newWells = Array.from(new Set(MOCK_DATA.map(e => e.pozo))).sort();
        setSelectedWells(newWells);
      }
    } catch (error) {
      console.error("Failed to load from DB", error);
      setEvents(MOCK_DATA);
      const newWells = Array.from(new Set(MOCK_DATA.map(e => e.pozo))).sort();
      setSelectedWells(newWells);
    } finally {
      setIsLoadingDB(false);
    }
  };

  // 1. Available Wells
  const availableWells = useMemo(() => {
    return Array.from(new Set(events.map(e => e.pozo))).sort();
  }, [events]);

  // 2. Centralized Category Mapping Logic
  const categoryMap = useMemo(() => {
    const uniqueCategories = Array.from(new Set(events.map(e => e.subcategoria_npt))).sort();
    const map: Record<string, CategoryStyle> = {};
    
    uniqueCategories.forEach((cat: string, index: number) => {
      const style = DYNAMIC_PALETTE[index % DYNAMIC_PALETTE.length];
      map[cat] = {
        label: cat,
        color: style.color,
        iconClass: style.iconClass
      };
    });
    return map;
  }, [events]);

  const categoriesList = useMemo(() => {
      return Object.keys(categoryMap).sort();
  }, [categoryMap]);

  // Handlers
  const handleManualAddEvent = async (newEvent: Omit<DrillingEvent, 'id'>) => {
    try {
        await createDrillingEvent(newEvent);
        await loadDataFromSupabase();
    } catch (error) {
        throw error;
    }
  };

  const toggleWell = (well: string) => {
    setSelectedWells(prev => 
      prev.includes(well) ? prev.filter(w => w !== well) : [...prev, well]
    );
  };

  const handleSelectAll = (visibleWells?: string[]) => {
    if (visibleWells && visibleWells.length > 0) {
        const newSelection = new Set([...selectedWells, ...visibleWells]);
        setSelectedWells(Array.from(newSelection).sort());
    } else {
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

  // FULL SCREEN LAYOUT
  return (
    <div className="h-screen w-screen bg-slate-900 flex flex-col font-sans text-slate-200 overflow-hidden transition-colors duration-300">
      
      <Header />
      
      <FilterBar 
        availableWells={availableWells}
        selectedWells={selectedWells}
        onToggleWell={toggleWell}
        onSelectAll={handleSelectAll}
        onSelectNone={handleSelectNone}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        isProcessing={isProcessing}
      />

      <AddEventModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleManualAddEvent}
        existingWells={availableWells}
        categories={categoriesList}
      />

      {/* Main Content Area - Flex Grow to Fill remaining height */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Sidebar - Fixed width, scrolls internally */}
        <Sidebar 
            categoryMap={categoryMap}
            selectedCategories={selectedCategories}
            onToggleCategory={toggleCategory}
            onClearCategories={clearCategories}
        />

        {/* Chart/Table Area - Flex grow, fits remaining space */}
        <main className="flex-1 min-w-0 bg-slate-900 p-2 lg:p-4 overflow-hidden flex flex-col">
            <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 h-full flex flex-col overflow-hidden transition-colors duration-300">
                {isLoadingDB ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <i className="fa-solid fa-circle-notch fa-spin text-4xl text-orange-500 mb-4"></i>
                        <p className="text-slate-400 font-medium">Conectando con Supabase...</p>
                    </div>
                ) : (
                    <>
                        {viewMode === 'chart' ? (
                            <div className="h-full flex flex-col">
                                {/* Chart Header */}
                                <div className="px-6 py-3 border-b border-slate-700 flex justify-between items-center bg-slate-800 flex-shrink-0 transition-colors duration-300">
                                    <h2 className="text-lg font-bold text-white border-l-4 border-orange-500 pl-3">
                                        Diagrama Vertical
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        {selectedCategories.length > 0 && (
                                            <span className="text-xs bg-orange-900/30 text-orange-300 px-2 py-1 rounded-full font-medium border border-orange-800">
                                                Filtro: {selectedCategories.length} activos
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {/* Chart Content - Takes all remaining height */}
                                <div className="flex-1 overflow-hidden relative">
                                    <WellDiagram 
                                        events={events} 
                                        selectedWells={selectedWells} 
                                        categoryMap={categoryMap}
                                        selectedCategories={selectedCategories}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col">
                                <div className="px-6 py-4 border-b border-slate-700 flex-shrink-0">
                                    <h2 className="text-lg font-bold text-white border-l-4 border-orange-500 pl-3">
                                        Tabla de Eventos
                                    </h2>
                                </div>
                                <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                                    <SummaryTable 
                                        events={events} 
                                        selectedWells={selectedWells} 
                                    />
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
      </div>
    </div>
  );
};

export default App;
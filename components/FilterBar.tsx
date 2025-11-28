import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ViewMode } from '../types';

interface FilterBarProps {
  availableWells: string[];
  selectedWells: string[];
  onToggleWell: (well: string) => void;
  onSelectAll: (filteredWells?: string[]) => void;
  onSelectNone: () => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onOpenAddModal: () => void;
  isProcessing: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({
  availableWells,
  selectedWells,
  onToggleWell,
  onSelectAll,
  onSelectNone,
  viewMode,
  setViewMode,
  onOpenAddModal,
  isProcessing
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter wells based on search term
  const filteredAvailableWells = useMemo(() => {
    if (!searchTerm) return availableWells;
    return availableWells.filter(well => 
      well.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableWells, searchTerm]);

  return (
    <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 shadow-sm backdrop-blur-md bg-opacity-95 dark:bg-opacity-95 transition-colors duration-300">
      <div className="max-w-[1920px] mx-auto px-4 py-3 sm:px-6 lg:px-8">
        
        {/* Main Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* Manual Add Button */}
            <button
                onClick={onOpenAddModal}
                disabled={isProcessing}
                className="flex items-center gap-2 py-2 px-4 rounded-md font-medium shadow-sm transition-all transform hover:-translate-y-0.5 bg-orange-600 hover:bg-orange-500 text-white border border-orange-600 active:scale-95 group"
                title="Agregar evento manualmente"
            >
                <div className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center transition-colors">
                    <i className="fa-solid fa-plus text-white text-xs"></i>
                </div>
                <span className="hidden lg:inline">Nuevo Evento</span>
            </button>

            <div className="hidden xl:block text-xs text-slate-500 dark:text-slate-400 border-l border-slate-300 dark:border-slate-600 pl-3 ml-1">
                <p className="font-semibold text-slate-600 dark:text-slate-300">Gestión de Eventos</p>
                <p className="font-mono text-slate-400 dark:text-slate-500 text-[10px]">Base de datos en tiempo real</p>
            </div>
          </div>

          {/* Right Side: Filters and View Toggles */}
          <div className="flex flex-col sm:flex-row gap-3">
            
            {/* Well Filter Dropdown */}
            {availableWells.length > 0 && (
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={`w-full sm:w-auto flex items-center justify-between gap-3 px-4 py-2 text-sm font-medium rounded-md border transition-all shadow-sm active:scale-95 ${
                            isDropdownOpen 
                                ? 'bg-white dark:bg-slate-800 border-orange-500 text-slate-800 dark:text-white ring-2 ring-orange-100 dark:ring-orange-900' 
                                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-400'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <i className="fa-solid fa-filter text-slate-400"></i>
                            <span>Filtrar Pozos</span>
                            <span className="bg-slate-800 dark:bg-slate-600 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">
                                {selectedWells.length}
                            </span>
                        </div>
                        <i className={`fa-solid fa-chevron-down transition-transform text-xs ${isDropdownOpen ? 'rotate-180' : ''}`}></i>
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden ring-1 ring-black ring-opacity-5 animate-in fade-in slide-in-from-top-2 duration-200">
                            
                            {/* Search Box */}
                            <div className="p-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                                <div className="relative">
                                    <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs"></i>
                                    <input 
                                        type="text"
                                        placeholder="Buscar pozo (ej: EH)..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* Dropdown Actions */}
                            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    {filteredAvailableWells.length} Visibles
                                </span>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => onSelectAll(filteredAvailableWells)} 
                                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium hover:underline"
                                    >
                                        Todos
                                    </button>
                                    <span className="text-slate-300 dark:text-slate-600">|</span>
                                    <button 
                                        onClick={onSelectNone} 
                                        className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium hover:underline"
                                    >
                                        Ninguno
                                    </button>
                                </div>
                            </div>
                            
                            {/* Scrollable List */}
                            <div className="max-h-64 overflow-y-auto custom-scrollbar p-1">
                                {filteredAvailableWells.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-slate-400">
                                        No se encontraron pozos.
                                    </div>
                                ) : (
                                    filteredAvailableWells.map(well => (
                                        <label 
                                            key={well} 
                                            className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded cursor-pointer transition-colors group"
                                        >
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all shadow-sm ${
                                                selectedWells.includes(well) 
                                                    ? 'bg-orange-500 border-orange-500 text-white scale-110' 
                                                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-500 group-hover:border-slate-400'
                                            }`}>
                                                {selectedWells.includes(well) && <i className="fa-solid fa-check text-[10px]"></i>}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={selectedWells.includes(well)}
                                                onChange={() => onToggleWell(well)}
                                            />
                                            <span className={`text-sm ${selectedWells.includes(well) ? 'text-slate-800 dark:text-white font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
                                                {well}
                                            </span>
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* View Toggles */}
            <div className="flex bg-slate-200 dark:bg-slate-700 p-1 rounded-lg shadow-inner">
                <button
                onClick={() => setViewMode('chart')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    viewMode === 'chart' 
                    ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm transform scale-105' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-600'
                }`}
                title="Vista Gráfica"
                >
                <i className="fa-solid fa-chart-column"></i>
                <span className="hidden sm:inline">Gráfico</span>
                </button>
                <button
                onClick={() => setViewMode('table')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    viewMode === 'table' 
                    ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm transform scale-105' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-600'
                }`}
                title="Tabla Resumen"
                >
                <i className="fa-solid fa-table"></i>
                <span className="hidden sm:inline">Tabla</span>
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
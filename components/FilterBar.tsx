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
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  onFileUpload,
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
    <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-[1920px] mx-auto px-4 py-3 sm:px-6 lg:px-8">
        
        {/* Main Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* File Upload */}
          <div className="flex items-center gap-3">
            <label className="relative cursor-pointer bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-md shadow transition-colors flex items-center gap-2 group whitespace-nowrap">
                <i className={`fa-solid fa-file-excel ${isProcessing ? 'animate-bounce' : ''} text-green-400`}></i>
                <span>{isProcessing ? 'Procesando...' : 'Cargar Excel'}</span>
                <input 
                    type="file" 
                    accept=".xlsx, .xls" 
                    onChange={onFileUpload} 
                    className="hidden" 
                    disabled={isProcessing}
                />
            </label>
            <div className="hidden lg:block text-xs text-slate-500 border-l border-slate-300 pl-3 ml-1">
                <p>Columnas requeridas:</p>
                <p className="font-mono text-slate-400">pozo, prof_desde, subcategoria_npt, comentario</p>
            </div>
          </div>

          {/* Right Side: Filters and View Toggles */}
          <div className="flex flex-col sm:flex-row gap-3">
            
            {/* Well Filter Dropdown */}
            {availableWells.length > 0 && (
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={`w-full sm:w-auto flex items-center justify-between gap-3 px-4 py-2 text-sm font-medium rounded-md border transition-all shadow-sm ${
                            isDropdownOpen 
                                ? 'bg-white border-orange-500 text-slate-800 ring-1 ring-orange-500' 
                                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <i className="fa-solid fa-filter text-slate-400"></i>
                            <span>Filtrar Pozos</span>
                            <span className="bg-slate-800 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                                {selectedWells.length}
                            </span>
                        </div>
                        <i className={`fa-solid fa-chevron-down transition-transform text-xs ${isDropdownOpen ? 'rotate-180' : ''}`}></i>
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-2xl border border-slate-200 z-50 overflow-hidden ring-1 ring-black ring-opacity-5">
                            
                            {/* Search Box */}
                            <div className="p-3 border-b border-slate-100 bg-slate-50">
                                <div className="relative">
                                    <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs"></i>
                                    <input 
                                        type="text"
                                        placeholder="Buscar pozo (ej: EH)..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* Dropdown Actions */}
                            <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    {filteredAvailableWells.length} Visibles
                                </span>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => onSelectAll(filteredAvailableWells)} 
                                        className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline"
                                    >
                                        Todos
                                    </button>
                                    <span className="text-slate-300">|</span>
                                    <button 
                                        onClick={onSelectNone} 
                                        className="text-xs text-slate-500 hover:text-slate-700 font-medium hover:underline"
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
                                            className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded cursor-pointer transition-colors group"
                                        >
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shadow-sm ${
                                                selectedWells.includes(well) 
                                                    ? 'bg-blue-600 border-blue-600 text-white' 
                                                    : 'bg-white border-slate-300 group-hover:border-slate-400'
                                            }`}>
                                                {selectedWells.includes(well) && <i className="fa-solid fa-check text-[10px]"></i>}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={selectedWells.includes(well)}
                                                onChange={() => onToggleWell(well)}
                                            />
                                            <span className={`text-sm ${selectedWells.includes(well) ? 'text-slate-800 font-medium' : 'text-slate-600'}`}>
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
            <div className="flex bg-slate-200 p-1 rounded-lg">
                <button
                onClick={() => setViewMode('chart')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    viewMode === 'chart' 
                    ? 'bg-white text-slate-900 shadow-sm text-orange-600' 
                    : 'text-slate-500 hover:text-slate-700'
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
                    ? 'bg-white text-slate-900 shadow-sm text-orange-600' 
                    : 'text-slate-500 hover:text-slate-700'
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
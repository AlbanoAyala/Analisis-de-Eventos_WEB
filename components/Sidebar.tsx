import React from 'react';
import { CategoryStyle } from '../types';

interface SidebarProps {
  categoryMap: Record<string, CategoryStyle>;
  selectedCategories: string[];
  onToggleCategory: (category: string) => void;
  onClearCategories: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  categoryMap, 
  selectedCategories, 
  onToggleCategory,
  onClearCategories
}) => {
  const categories = Object.keys(categoryMap).sort();

  return (
    <aside className="w-full lg:w-80 flex-shrink-0 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 h-full overflow-hidden shadow-inner flex flex-col transition-colors duration-300">
      <div className="p-5 flex flex-col h-full">
        
        {/* Header Section */}
        <div className="flex justify-between items-end mb-6 border-b border-slate-100 dark:border-slate-700 pb-4 flex-shrink-0">
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wide">
              <i className="fa-solid fa-layer-group text-orange-500 mr-2"></i>
              Referencias
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                Filtre los eventos haciendo click
            </p>
          </div>
          {selectedCategories.length > 0 && (
            <button 
              onClick={onClearCategories}
              className="text-xs bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-1 rounded hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors font-medium flex items-center gap-1"
            >
              <i className="fa-solid fa-xmark"></i> Limpiar
            </button>
          )}
        </div>

        {/* Categories List - Scrollable Area */}
        <div className="space-y-2 pr-1 custom-scrollbar overflow-y-auto flex-1">
            {categories.map((cat) => {
                const style = categoryMap[cat];
                const isSelected = selectedCategories.includes(cat);
                const isDimmed = selectedCategories.length > 0 && !isSelected;

                return (
                    <div 
                        key={cat}
                        onClick={() => onToggleCategory(cat)}
                        className={`
                            relative overflow-hidden
                            flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300
                            border group
                            ${isSelected 
                                ? 'bg-slate-50 dark:bg-slate-700 border-orange-400 shadow-md transform translate-x-1' 
                                : 'bg-white dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-sm hover:translate-x-1'}
                            ${isDimmed ? 'opacity-40 grayscale' : 'opacity-100'}
                        `}
                    >
                        {/* Left Accent Bar */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 transition-colors ${isSelected ? 'bg-orange-500' : 'bg-transparent group-hover:bg-slate-300 dark:group-hover:bg-slate-600'}`}></div>

                        {/* Icon */}
                        <div 
                            className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs shadow-sm transition-all duration-300 ${isSelected ? 'scale-110 shadow-md' : 'group-hover:scale-105'}`}
                            style={{ background: isSelected || !isDimmed ? style.color : '#64748b' }}
                        >
                            <i className={`fa-solid ${style.iconClass}`}></i>
                        </div>
                        
                        {/* Text */}
                        <div className="flex-grow min-w-0">
                            <span className={`text-sm font-bold block truncate transition-colors ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'}`}>
                                {style.label}
                            </span>
                        </div>

                        {/* Checkmark */}
                        <div className={`transition-all duration-300 ${isSelected ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
                             <i className="fa-solid fa-circle-check text-orange-500 text-lg"></i>
                        </div>
                    </div>
                );
            })}
        </div>
        
        {/* Footer Hint */}
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900 rounded text-center border border-slate-100 dark:border-slate-700 flex-shrink-0">
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
                <i className="fa-solid fa-lightbulb text-yellow-400 dark:text-yellow-600 mr-1"></i>
                Tip: Puede seleccionar múltiples categorías.
            </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
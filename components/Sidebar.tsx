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
    <aside className="w-full lg:w-72 flex-shrink-0 bg-white border-r border-slate-200 lg:min-h-[calc(100vh-8rem)]">
      <div className="p-4 sticky top-20">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
            Referencias
          </h3>
          {selectedCategories.length > 0 && (
            <button 
              onClick={onClearCategories}
              className="text-xs text-orange-600 hover:text-orange-700 font-medium hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="space-y-2">
            <p className="text-xs text-slate-400 mb-2">
                Seleccione categorías para filtrar el gráfico:
            </p>
            {categories.map((cat) => {
                const style = categoryMap[cat];
                const isSelected = selectedCategories.includes(cat);
                const isDimmed = selectedCategories.length > 0 && !isSelected;

                return (
                    <div 
                        key={cat}
                        onClick={() => onToggleCategory(cat)}
                        className={`
                            flex items-center gap-3 p-2 rounded-md cursor-pointer transition-all duration-200 border
                            ${isSelected 
                                ? 'bg-slate-50 border-orange-400 shadow-sm' 
                                : 'bg-transparent border-transparent hover:bg-slate-50 hover:border-slate-200'}
                            ${isDimmed ? 'opacity-40 grayscale' : 'opacity-100'}
                        `}
                    >
                        <div 
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs shadow-sm transition-transform ${isSelected ? 'scale-110' : ''}`}
                            style={{ backgroundColor: style.color }}
                        >
                            <i className={`fa-solid ${style.iconClass}`}></i>
                        </div>
                        <span className={`text-sm font-medium ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                            {style.label}
                        </span>
                        {isSelected && (
                             <i className="fa-solid fa-check text-orange-500 text-xs ml-auto"></i>
                        )}
                    </div>
                );
            })}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
import React, { useMemo } from 'react';
import { DrillingEvent, CategoryStyle } from '../types';
import { DYNAMIC_PALETTE } from '../constants';

interface SummaryTableProps {
  events: DrillingEvent[];
  selectedWells: string[];
}

const SummaryTable: React.FC<SummaryTableProps> = ({ events, selectedWells }) => {
  const filteredEvents = events.filter(e => selectedWells.includes(e.pozo));

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

  if (filteredEvents.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 bg-white rounded-lg shadow border border-slate-200">
        <p>No hay datos para mostrar con los filtros actuales.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Pozo
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Profundidad (m)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Categoría
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Comentario
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredEvents.map((event) => {
               const style = categoryMap[event.subcategoria_npt] || {
                  label: event.subcategoria_npt,
                  color: '#94a3b8',
                  iconClass: 'fa-circle'
               };
               return (
                <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                    {event.pozo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-mono">
                    {event.prof_desde}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: `${style.color}20`, color: style.color }}
                    >
                      <i className={`fa-solid ${style.iconClass} mr-2`}></i>
                      {style.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 max-w-md truncate" title={event.comentario}>
                    {event.comentario}
                  </td>
                </tr>
               );
            })}
          </tbody>
        </table>
      </div>
      <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 text-xs text-slate-500 text-right">
        Mostrando {filteredEvents.length} eventos
      </div>
    </div>
  );
};

export default SummaryTable;
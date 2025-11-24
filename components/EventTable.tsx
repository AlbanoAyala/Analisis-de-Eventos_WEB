import React from 'react';
import { DrillingEvent, WellData } from '../types';

interface EventTableProps {
  selectedWells: WellData[];
}

export const EventTable: React.FC<EventTableProps> = ({ selectedWells }) => {
  // Flatten events
  const allEvents = selectedWells.flatMap(w => 
    w.events.map(e => ({ ...e, wellName: w.name }))
  ).sort((a, b) => a.wellName.localeCompare(b.wellName) || a.prof_desde - b.prof_desde);

  if (allEvents.length === 0) {
    return <div className="p-8 text-center text-slate-500">No hay datos para mostrar.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-700">
      <table className="w-full text-left text-sm text-slate-400">
        <thead className="bg-slate-800 text-xs uppercase text-slate-200">
          <tr>
            <th className="px-6 py-3 font-bold">Pozo</th>
            <th className="px-6 py-3 font-bold">Profundidad (m)</th>
            <th className="px-6 py-3 font-bold">Subcategoría / Detalle</th>
            <th className="px-6 py-3 font-bold">Comentario</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700 bg-slate-900">
          {allEvents.map((event) => (
            <tr key={event.id} className="hover:bg-slate-800/50 transition-colors">
              <td className="px-6 py-4 font-medium text-white">{event.wellName}</td>
              <td className="px-6 py-4 font-mono text-blue-400">{event.prof_desde}</td>
              <td className="px-6 py-4 max-w-xs">
                <span className="inline-block rounded-lg bg-slate-800 border border-slate-600 px-2 py-1 text-xs font-medium text-slate-300 whitespace-normal">
                  {event.subcategoria_npt}
                </span>
              </td>
              <td className="px-6 py-4 text-slate-300 max-w-md truncate" title={event.comentario}>
                {/* Only show comment if it's different from the subcategory to avoid redundancy */}
                {(event.comentario && event.comentario !== event.subcategoria_npt) ? event.comentario : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
import React, { useState } from 'react';
import { DrillingEvent } from '../types';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: Omit<DrillingEvent, 'id'>) => Promise<void>;
  existingWells: string[];
  categories: string[];
}

const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, onClose, onSubmit, existingWells, categories }) => {
  const [formData, setFormData] = useState({
    pozo: '',
    prof_desde: '',
    subcategoria_npt: '',
    comentario: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pozo || !formData.prof_desde || !formData.subcategoria_npt) {
        alert("Por favor complete los campos requeridos");
        return;
    }

    setIsSubmitting(true);
    try {
        await onSubmit({
            pozo: formData.pozo,
            prof_desde: Number(formData.prof_desde),
            subcategoria_npt: formData.subcategoria_npt,
            comentario: formData.comentario
        });
        setFormData({ pozo: '', prof_desde: '', subcategoria_npt: '', comentario: '' });
        onClose();
    } catch (error) {
        console.error(error);
        alert("Error al guardar el evento");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Background backdrop */}
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" onClick={onClose} aria-hidden="true"></div>

        {/* Modal panel */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="relative inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full border border-slate-200 dark:border-slate-700">
          <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 sm:mx-0 sm:h-10 sm:w-10">
                <i className="fa-solid fa-plus text-blue-600 dark:text-blue-400"></i>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                  Agregar Evento Manualmente
                </h3>
                <div className="mt-4 space-y-4">
                    
                    {/* Pozo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pozo *</label>
                        <div className="mt-1 relative">
                            <input 
                                type="text"
                                list="wells-list"
                                value={formData.pozo}
                                onChange={(e) => setFormData({...formData, pozo: e.target.value})}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-slate-600 rounded-md p-2 border bg-white text-gray-900"
                                placeholder="Nombre del Pozo (ej: CGC-101)"
                                required
                            />
                            <datalist id="wells-list">
                                {existingWells.map(w => <option key={w} value={w} />)}
                            </datalist>
                        </div>
                    </div>

                    {/* Profundidad */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profundidad (m) *</label>
                        <input 
                            type="number"
                            value={formData.prof_desde}
                            onChange={(e) => setFormData({...formData, prof_desde: e.target.value})}
                            className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-slate-600 rounded-md p-2 border bg-white text-gray-900"
                            placeholder="Ej: 1500"
                            required
                        />
                    </div>

                    {/* Categoría Dropdown */}
                    <div>
                        <div className="flex justify-between items-center">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoría / Subcategoría *</label>
                            <button 
                                type="button" 
                                onClick={() => setIsCustomCategory(!isCustomCategory)}
                                className="text-[10px] text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline"
                            >
                                {isCustomCategory ? 'Seleccionar de lista' : 'Nueva categoría'}
                            </button>
                        </div>
                        
                        {isCustomCategory ? (
                             <input 
                                type="text"
                                value={formData.subcategoria_npt}
                                onChange={(e) => setFormData({...formData, subcategoria_npt: e.target.value})}
                                className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-slate-600 rounded-md p-2 border bg-white text-gray-900"
                                placeholder="Escriba nueva categoría..."
                                required
                                autoFocus
                            />
                        ) : (
                            <select
                                value={formData.subcategoria_npt}
                                onChange={(e) => setFormData({...formData, subcategoria_npt: e.target.value})}
                                className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-slate-600 rounded-md p-2 border bg-white text-gray-900"
                                required
                            >
                                <option value="">-- Seleccionar --</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Comentario */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Comentario</label>
                        <textarea 
                            value={formData.comentario}
                            onChange={(e) => setFormData({...formData, comentario: e.target.value})}
                            rows={3}
                            className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-slate-600 rounded-md p-2 border bg-white text-gray-900"
                            placeholder="Descripción del evento..."
                        />
                    </div>

                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-slate-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-slate-200 dark:border-slate-700">
            <button 
                type="button" 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Evento'}
            </button>
            <button 
                type="button" 
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEventModal;
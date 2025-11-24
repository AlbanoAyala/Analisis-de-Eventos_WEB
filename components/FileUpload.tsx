import React, { useRef } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div 
      className="w-full max-w-2xl mx-auto mt-10 p-8 border-2 border-dashed border-slate-600 rounded-xl bg-slate-850 hover:bg-slate-800 transition-colors cursor-pointer flex flex-col items-center justify-center text-center group"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleChange} 
        accept=".xlsx, .xls, .csv" 
        className="hidden" 
      />
      
      <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {isLoading ? (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        ) : (
          <FileSpreadsheet className="w-8 h-8 text-blue-400" />
        )}
      </div>

      <h3 className="text-xl font-semibold text-white mb-2">Cargar Reporte de Perforación</h3>
      <p className="text-slate-400 text-sm mb-4">
        Arrastra tu archivo Excel aquí o haz clic para buscarlo.
        <br />
        <span className="text-xs text-slate-500">Columnas requeridas: 'pozo', 'prof_desde', 'subcategoria_npt', 'comentario'</span>
      </p>
      
      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-2">
        <Upload size={16} />
        Seleccionar Archivo
      </button>
    </div>
  );
};
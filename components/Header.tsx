import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-lg border-b-4 border-orange-500 sticky top-0 z-50 flex-shrink-0">
      <div className="max-w-[1920px] mx-auto px-4 py-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center gap-4 group cursor-default">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg shadow-orange-500/20 shadow-lg flex items-center justify-center text-white font-bold text-2xl transform group-hover:scale-105 transition-transform duration-300">
                <i className="fa-solid fa-oil-well"></i>
            </div>
            <div>
                <h1 className="text-2xl font-black tracking-tight uppercase flex items-center gap-2">
                    DrillViz 
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">Pro</span>
                </h1>
                <p className="text-slate-400 text-xs tracking-wider font-medium flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    MONITOREO DE OPERACIONES
                </p>
            </div>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-300">Ingeniería de Perforación CGC</p>
            <div className="flex items-center justify-end gap-2 mt-1">
               <span className="inline-block bg-slate-800/50 backdrop-blur text-slate-400 text-[10px] px-2 py-0.5 rounded border border-slate-700">v1.0.3</span>
               <i className="fa-solid fa-shield-halved text-slate-600 text-xs" title="Conexión Segura"></i>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
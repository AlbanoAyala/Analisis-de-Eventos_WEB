import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-900 text-white shadow-lg border-b-4 border-orange-500">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded flex items-center justify-center text-slate-900 font-bold text-xl">
                <i className="fa-solid fa-oil-well"></i>
            </div>
            <div>
                <h1 className="text-2xl font-bold tracking-tight uppercase">DrillViz <span className="text-orange-500">Pro</span></h1>
                <p className="text-slate-400 text-xs tracking-wider">VISUALIZACIÓN DE EVENTOS DE PERFORACIÓN</p>
            </div>
        </div>
        <div className="mt-4 sm:mt-0 text-right">
          <p className="text-sm font-medium text-slate-300">Desarrollado por Ingeniería de Perforación CGC</p>
          <span className="inline-block bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded mt-1">Versión 1.0</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
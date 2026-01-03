
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="px-8 py-6 flex justify-between items-center z-10 pointer-events-none">
      <div className="flex items-center gap-4 pointer-events-auto">
        <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center shadow-lg shadow-sky-500/20">
          <i className="fas fa-globe-americas text-white text-2xl"></i>
        </div>
        <div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Chronos<span className="text-sky-500">World</span></h1>
          <p className="text-slate-500 text-sm font-medium">Spatiotemporal Intelligence Engine</p>
        </div>
      </div>

      <div className="flex gap-6 pointer-events-auto">
        <button className="px-4 py-2 bg-slate-900/80 border border-slate-800 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all text-sm flex items-center gap-2">
          <i className="fas fa-search"></i>
          Search Cities
        </button>
        <button className="px-4 py-2 bg-sky-600 rounded-lg text-white hover:bg-sky-500 transition-all text-sm font-bold shadow-lg shadow-sky-600/30">
          Sync Time
        </button>
      </div>
    </header>
  );
};

export default Header;

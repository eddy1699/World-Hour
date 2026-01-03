
import React from 'react';
import { CountryData } from '../types';
import { getTimeForTimezone, getDayNightStatus, getSeason } from '../utils/timeUtils';

interface StatsOverlayProps {
  hoveredCountry: CountryData | null;
  currentTime: Date;
}

const StatsOverlay: React.FC<StatsOverlayProps> = ({ hoveredCountry, currentTime }) => {
  if (!hoveredCountry) {
    return (
      <div className="absolute bottom-10 right-10 p-6 bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl w-80 text-center animate-pulse">
        <p className="text-slate-300 text-sm">Hover over a country to explore time and space</p>
      </div>
    );
  }

  const isDay = getDayNightStatus(currentTime, hoveredCountry.timezone) === 'Day';
  const season = getSeason(hoveredCountry.latitude, currentTime);

  return (
    <div className="absolute bottom-10 right-10 p-6 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl w-80 shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all duration-300 transform translate-y-0 opacity-100">
      <div className="flex items-start justify-between mb-6">
        <div>
          <span className="text-sky-600 text-[10px] font-black uppercase tracking-[0.2em]">Active Region</span>
          <h2 className="text-slate-900 text-3xl font-bold leading-none truncate max-w-[180px]">{hoveredCountry.name}</h2>
        </div>
        <div className={`p-3 rounded-xl shadow-lg ${isDay ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
          <i className={`fas ${isDay ? 'fa-sun' : 'fa-moon'} text-xl`}></i>
        </div>
      </div>

      <div className="space-y-4">
        {/* Local Time Card */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Current Local Time</p>
          <p className="text-3xl font-mono text-slate-900 font-bold tracking-tight">
            {getTimeForTimezone(currentTime, hoveredCountry.timezone)}
          </p>
        </div>

        {/* Season & Timezone Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-slate-400 text-[9px] font-bold uppercase mb-1">Timezone</p>
            <p className="text-slate-700 text-sm font-semibold truncate">{hoveredCountry.timezone.split('/')[1] || hoveredCountry.timezone}</p>
          </div>
          <div className={`p-3 rounded-xl border border-transparent ${season.color} bg-opacity-10`}>
            <p className={`${season.color.replace('bg-', 'text-')} text-[9px] font-bold uppercase mb-1 opacity-80`}>Estación</p>
            <div className="flex items-center gap-2">
              <i className={`fas ${season.icon} ${season.color.replace('bg-', 'text-')}`}></i>
              <p className={`text-slate-800 text-sm font-bold`}>{season.name}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-slate-500 text-xs italic">
        <i className="fas fa-info-circle text-sky-500"></i>
        <span>Click for AI cultural insights</span>
      </div>
    </div>
  );
};

export default StatsOverlay;

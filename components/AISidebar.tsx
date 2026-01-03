
import React, { useState, useEffect } from 'react';
import { CountryData, GeminiAnalysis } from '../types';
import { getGeminiInsight } from '../services/geminiService';
import { getSeason } from '../utils/timeUtils';

interface AISidebarProps {
  country: CountryData;
  onClose: () => void;
}

const AISidebar: React.FC<AISidebarProps> = ({ country, onClose }) => {
  const [analysis, setAnalysis] = useState<GeminiAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsight = async () => {
      setLoading(true);
      const currentTime = new Date();
      const season = getSeason(country.latitude, currentTime);
      const insight = await getGeminiInsight(country.name, country.timezone, season.name);
      setAnalysis(insight);
      setLoading(false);
    };
    fetchInsight();
  }, [country]);

  return (
    <div className="fixed top-0 right-0 h-full w-full max-w-[450px] bg-slate-900 border-l border-slate-800 z-50 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)] transform animate-in slide-in-from-right duration-500">
      <div className="p-8 flex justify-between items-center border-b border-slate-800">
        <div>
          <h2 className="text-white text-2xl font-bold">{country.name}</h2>
          <p className="text-slate-500 text-sm italic">AI Intelligence Briefing</p>
        </div>
        <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all">
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-4 bg-slate-800 rounded w-1/4"></div>
            <div className="h-32 bg-slate-800 rounded"></div>
            <div className="h-4 bg-slate-800 rounded w-1/4"></div>
            <div className="h-32 bg-slate-800 rounded"></div>
            <div className="h-4 bg-slate-800 rounded w-1/4"></div>
            <div className="h-32 bg-slate-800 rounded"></div>
          </div>
        ) : analysis ? (
          <>
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-sky-400">
                <i className="fas fa-landmark"></i>
                <h3 className="font-bold uppercase tracking-widest text-xs">Current Context</h3>
              </div>
              <div className="p-6 bg-slate-800/40 rounded-2xl border border-slate-700/30 text-slate-300 leading-relaxed">
                {analysis.culture}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-purple-400">
                <i className="fas fa-wind"></i>
                <h3 className="font-bold uppercase tracking-widest text-xs">Atmospheric Vibe</h3>
              </div>
              <div className="p-6 bg-slate-800/40 rounded-2xl border border-slate-700/30 text-slate-300 italic">
                "{analysis.vibe}"
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-emerald-400">
                <i className="fas fa-lightbulb"></i>
                <h3 className="font-bold uppercase tracking-widest text-xs">Actionable Suggestion</h3>
              </div>
              <div className="p-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-100 font-medium">
                {analysis.suggestion}
              </div>
            </section>
          </>
        ) : (
          <div className="text-slate-500 text-center py-20">
            <i className="fas fa-exclamation-triangle text-4xl mb-4 text-amber-500"></i>
            <p>Could not retrieve intelligence for this region.</p>
          </div>
        )}
      </div>

      <div className="p-8 bg-slate-950/50 text-slate-600 text-[10px] text-center uppercase tracking-widest">
        Data synthesized by Gemini 3 Flash
      </div>
    </div>
  );
};

export default AISidebar;


import React, { useState, useEffect } from 'react';
import WorldMap from './components/WorldMap';
import Header from './components/Header';
import StatsOverlay from './components/StatsOverlay';
import AISidebar from './components/AISidebar';
import { CountryData } from './types';

const App: React.FC = () => {
  const [hoveredCountry, setHoveredCountry] = useState<CountryData | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Keep global time ticking
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden flex flex-col">
      <Header />
      
      <main className="flex-1 relative">
        <WorldMap 
          onHover={setHoveredCountry} 
          onSelect={setSelectedCountry}
          currentTime={currentTime}
        />
        
        <StatsOverlay 
          hoveredCountry={hoveredCountry} 
          currentTime={currentTime} 
        />
      </main>

      {selectedCountry && (
        <AISidebar 
          country={selectedCountry} 
          onClose={() => setSelectedCountry(null)} 
        />
      )}

      {/* Footer Info */}
      <div className="absolute bottom-4 left-4 text-slate-400 text-xs pointer-events-none font-medium">
        <p>Interactive Chronos Mapper &bull; Global Day/Night Projection</p>
      </div>
    </div>
  );
};

export default App;

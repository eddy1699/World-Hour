
import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { CountryData } from '../types';
import { getISOFromFeature, getTimeForTimezone, getSolarPosition } from '../utils/timeUtils';
import { COUNTRY_TIMEZONES } from '../constants';

interface WorldMapProps {
  onHover: (data: CountryData | null) => void;
  onSelect: (data: CountryData | null) => void;
  currentTime: Date;
}

const WorldMap: React.FC<WorldMapProps> = ({ onHover, onSelect, currentTime }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [worldData, setWorldData] = useState<any>(null);
  const [topology, setTopology] = useState<any>(null);
  const [rotation, setRotation] = useState<[number, number, number]>([0, -20, 0]);
  const [zoomScale, setZoomScale] = useState(1);
  const [activeCountry, setActiveCountry] = useState<any>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(res => res.json())
      .then(data => {
        setTopology(data);
        setWorldData(topojson.feature(data, data.objects.countries));
      });
  }, []);

  const baseScale = useMemo(() => Math.min(window.innerWidth, window.innerHeight) * 0.4, []);

  const projection = useMemo(() => 
    d3.geoOrthographic()
      .scale(baseScale * zoomScale)
      .translate([window.innerWidth / 2, window.innerHeight / 2])
      .rotate(rotation)
      .clipAngle(90)
      .precision(0.1),
  [rotation, zoomScale, baseScale]);

  const getReliefColor = (f: any) => {
    const centroid = d3.geoCentroid(f);
    const lat = Math.abs(centroid[1]);
    if (lat > 75) return '#f1f5f9';
    if (lat > 55) return '#14532d';
    if (lat < 20) return '#065f46';
    const lon = centroid[0];
    if ((lon > -20 && lon < 60) && (lat > 15 && lat < 35)) return '#b45309'; 
    return '#3f6212';
  };

  useEffect(() => {
    if (!canvasRef.current || !worldData) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    context.scale(dpr, dpr);

    const path = d3.geoPath(projection, context);
    context.clearRect(0, 0, width, height);

    const glowGradient = context.createRadialGradient(width/2, height/2, projection.scale(), width/2, height/2, projection.scale() + 40);
    glowGradient.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
    glowGradient.addColorStop(1, 'rgba(56, 189, 248, 0)');
    context.fillStyle = glowGradient;
    context.beginPath();
    context.arc(width/2, height/2, projection.scale() + 40, 0, 2 * Math.PI);
    context.fill();

    const oceanGradient = context.createRadialGradient(width/2 - projection.scale()*0.3, height/2 - projection.scale()*0.3, 0, width/2, height/2, projection.scale());
    oceanGradient.addColorStop(0, '#1d4ed8');
    oceanGradient.addColorStop(1, '#1e3a8a');
    context.fillStyle = oceanGradient;
    context.beginPath();
    context.arc(width/2, height/2, projection.scale(), 0, 2 * Math.PI);
    context.fill();

    context.beginPath();
    path(d3.geoGraticule()());
    context.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    context.lineWidth = 0.5;
    context.stroke();

    worldData.features.forEach((feature: any) => {
      context.beginPath();
      path(feature);
      context.fillStyle = getReliefColor(feature);
      context.fill();
    });

    if (topology) {
      context.beginPath();
      path(topojson.mesh(topology, topology.objects.countries, (a, b) => a !== b));
      context.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      context.lineWidth = Math.max(0.6, 1.2 / Math.sqrt(zoomScale));
      context.stroke();
    }

    const solarPos = getSolarPosition(currentTime);
    const nightCenter: [number, number] = [
      solarPos.longitude > 0 ? solarPos.longitude - 180 : solarPos.longitude + 180,
      -solarPos.latitude
    ];
    const nightCircle = d3.geoCircle().center(nightCenter).radius(90);
    context.beginPath();
    path(nightCircle() as any);
    context.fillStyle = 'rgba(0, 10, 30, 0.4)';
    context.fill();

    const shadowGradient = context.createRadialGradient(width/2, height/2, projection.scale() * 0.7, width/2, height/2, projection.scale());
    shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
    context.fillStyle = shadowGradient;
    context.beginPath();
    context.arc(width/2, height/2, projection.scale(), 0, 2 * Math.PI);
    context.fill();

    const coords = projection([solarPos.longitude, solarPos.latitude]);
    const distance = d3.geoDistance([solarPos.longitude, solarPos.latitude], [-rotation[0], -rotation[1]]);
    if (distance < Math.PI / 2 && coords) {
      context.beginPath();
      context.arc(coords[0], coords[1], 6 * zoomScale, 0, 2 * Math.PI);
      context.fillStyle = '#ffffff';
      context.shadowBlur = 20;
      context.shadowColor = '#fbbf24';
      context.fill();
      context.shadowBlur = 0;
    }
  }, [projection, worldData, topology, currentTime, zoomScale, rotation]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = d3.select(canvasRef.current);

    const drag = d3.drag<HTMLCanvasElement, unknown>()
      .on('drag', (event) => {
        const sens = 70 / (baseScale * zoomScale);
        setRotation(([l, p, g]) => [
          l + event.dx * sens,
          p - event.dy * sens,
          g
        ]);
      });

    const zoom = d3.zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.8, 15])
      .on('zoom', (event) => {
        setZoomScale(event.transform.k);
      });

    canvas.call(drag as any);
    canvas.call(zoom as any);
    canvas.call(zoom.transform as any, d3.zoomIdentity.scale(zoomScale));
  }, [baseScale, zoomScale]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!worldData) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x: e.clientX, y: e.clientY });

    const coords = projection.invert?.([x, y]);
    if (coords) {
      const found = worldData.features.find((f: any) => d3.geoContains(f, coords));
      if (found) {
        setActiveCountry(found);
        const iso = getISOFromFeature(found);
        const centroid = d3.geoCentroid(found);
        onHover({
          id: iso,
          name: found.properties.name,
          timezone: COUNTRY_TIMEZONES[iso] || 'UTC',
          capital: '',
          region: '',
          latitude: centroid[1]
        });
        return;
      }
    }
    setActiveCountry(null);
    onHover(null);
  };

  const handleClick = () => {
    if (activeCountry) {
      const iso = getISOFromFeature(activeCountry);
      const centroid = d3.geoCentroid(activeCountry);
      onSelect({
        id: iso,
        name: activeCountry.properties.name,
        timezone: COUNTRY_TIMEZONES[iso] || 'UTC',
        capital: '',
        region: '',
        latitude: centroid[1]
      });
    }
  };

  return (
    <div className="relative w-full h-full bg-[#020617] overflow-hidden">
      <canvas 
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {activeCountry && (
        <div 
          className="fixed pointer-events-none z-50 bg-slate-900/95 border border-sky-500/40 p-5 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl transform -translate-x-1/2 -translate-y-[130%] border-b-4 border-b-sky-500 min-w-[200px]"
          style={{ left: mousePos.x, top: mousePos.y }}
        >
          <div className="flex items-center gap-3 mb-2">
             <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center">
                <i className="fas fa-location-dot text-sky-400 text-xs"></i>
             </div>
             <h3 className="font-bold text-sm text-white tracking-tight">{activeCountry.properties.name}</h3>
          </div>
          <p className="text-4xl font-mono font-black text-sky-400 tracking-tighter">
            {getTimeForTimezone(currentTime, COUNTRY_TIMEZONES[getISOFromFeature(activeCountry)] || 'UTC').split(' ')[0]}
            <span className="text-sm ml-1 text-sky-600 font-bold">{getTimeForTimezone(currentTime, COUNTRY_TIMEZONES[getISOFromFeature(activeCountry)] || 'UTC').split(' ')[1]}</span>
          </p>
        </div>
      )}

      <div className="absolute top-28 left-8 flex flex-col gap-3">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl">
           <div className="flex items-center gap-3 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Global Sync Active</span>
           </div>
           <p className="text-xs text-slate-500 font-medium">Fronteras Vectoriales Optimizadas</p>
        </div>
      </div>
    </div>
  );
};

export default WorldMap;

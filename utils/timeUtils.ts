
import { COUNTRY_TIMEZONES, NAME_TO_ISO } from '../constants';

export const getTimeForTimezone = (date: Date, timezone: string): string => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: timezone
    }).format(date);
  } catch (e) {
    return date.toLocaleTimeString();
  }
};

export const getDayNightStatus = (date: Date, timezone: string): 'Day' | 'Night' => {
  try {
    const hourStr = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: timezone
    }).format(date);
    const hour = parseInt(hourStr, 10);
    return (hour >= 6 && hour < 18) ? 'Day' : 'Night';
  } catch (e) {
    const h = date.getHours();
    return (h >= 6 && h < 18) ? 'Day' : 'Night';
  }
};

export const getSeason = (lat: number | undefined, date: Date): { name: string; icon: string; color: string } => {
  if (lat === undefined) return { name: 'Unknown', icon: 'fa-question', color: 'bg-slate-500' };
  
  const month = date.getMonth(); // 0-11
  const isNorth = lat >= 0;

  // 0: Jan, 1: Feb, 2: Mar, 3: Apr, 4: May, 5: Jun, 6: Jul, 7: Aug, 8: Sep, 9: Oct, 10: Nov, 11: Dec
  if (isNorth) {
    if (month >= 2 && month <= 4) return { name: 'Primavera', icon: 'fa-seedling', color: 'bg-emerald-500' };
    if (month >= 5 && month <= 7) return { name: 'Verano', icon: 'fa-sun', color: 'bg-amber-500' };
    if (month >= 8 && month <= 10) return { name: 'Otoño', icon: 'fa-leaf', color: 'bg-orange-600' };
    return { name: 'Invierno', icon: 'fa-snowflake', color: 'bg-sky-500' };
  } else {
    // Hemisferio Sur es opuesto
    if (month >= 2 && month <= 4) return { name: 'Otoño', icon: 'fa-leaf', color: 'bg-orange-600' };
    if (month >= 5 && month <= 7) return { name: 'Invierno', icon: 'fa-snowflake', color: 'bg-sky-500' };
    if (month >= 8 && month <= 10) return { name: 'Primavera', icon: 'fa-seedling', color: 'bg-emerald-500' };
    return { name: 'Verano', icon: 'fa-sun', color: 'bg-amber-500' };
  }
};

export const getISOFromFeature = (feature: any): string => {
  const id = feature.id || '';
  if (COUNTRY_TIMEZONES[id]) return id;
  const name = feature.properties?.name;
  if (NAME_TO_ISO[name]) return NAME_TO_ISO[name];
  return 'UTC';
};

/**
 * Solar calculations for the terminator
 */
export function getSolarPosition(date: Date) {
  const msInDay = 86400000;
  const centuries = (date.getTime() / msInDay - 10957.5) / 36525;
  const longitude = (date.getTime() % msInDay) / msInDay * 360 - 180;
  
  const meanAnomaly = (357.52911 + centuries * (35999.05029 - 0.0001537 * centuries)) * Math.PI / 180;
  const sunLong = (280.46646 + centuries * (36000.76983 + centuries * 0.0003032)) * Math.PI / 180;
  const sunCenter = (Math.sin(meanAnomaly) * (1.914602 - centuries * (0.004817 + 0.000014 * centuries)) +
    Math.sin(2 * meanAnomaly) * (0.019993 - 0.000101 * centuries) +
    Math.sin(3 * meanAnomaly) * 0.000289) * Math.PI / 180;
  
  const sunTrueLong = sunLong + sunCenter;
  const oblique = (23.4392911 - centuries * (46.815 / 3600 + centuries * (0.00059 / 3600 - centuries * 0.001813 / 3600))) * Math.PI / 180;
  const declination = Math.asin(Math.sin(oblique) * Math.sin(sunTrueLong)) * 180 / Math.PI;
  const subsolarLng = -((date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600) / 24 * 360) + 180;
  
  return { 
    latitude: declination, 
    longitude: subsolarLng > 180 ? subsolarLng - 360 : subsolarLng < -180 ? subsolarLng + 360 : subsolarLng 
  };
}


export interface CountryData {
  id: string;
  name: string;
  timezone: string;
  capital: string;
  region: string;
  latitude?: number;
  population?: number;
}

export interface MapFeature {
  type: string;
  id: string;
  properties: {
    name: string;
  };
  geometry: any;
}

export interface GeminiAnalysis {
  culture: string;
  vibe: string;
  suggestion: string;
}

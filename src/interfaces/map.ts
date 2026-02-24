interface Location {
  name: string;
  position: {
    lat: number;
    lng: number;
  };
  aqi?: number;
  timestamp: number;
  address?: string;
}

interface WAQIStation {
  station: {
    name: string;
  };
  lat: number;
  lon: number;
  aqi: number;
}

export type { Location, WAQIStation };

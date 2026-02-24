interface HistoryEntry {
  aqi: number;
  timestamp: number;
}

interface AQI {
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  o3: number;
  so2: number;
  co: number;
  visibility: number;
  pressure: number;
  lastUpdated: number;
  hourlyHistory: HistoryEntry[];
  dailyHistory: HistoryEntry[];
  weeklyHistory: HistoryEntry[];
}

export type { AQI, HistoryEntry };

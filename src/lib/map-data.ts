import { WAQIStation } from "@/interfaces/map";

const WAQI_TOKEN = process.env.NEXT_PUBLIC_WAQI_API_TOKEN;

export const getAQIColor = (aqi: number, isMarker = false): string => {
  if (aqi <= 50) return isMarker ? "#22C55E" : "bg-green-500 text-white";
  if (aqi <= 100) return isMarker ? "#EAB308" : "bg-yellow-500 text-white";
  if (aqi <= 150) return isMarker ? "#EF4444" : "bg-red-500 text-white";
  return isMarker ? "#1F2937" : "bg-gray-800 text-white";
};

export const getAQILabel = (aqi: number): string => {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy";
  return "Very Unhealthy";
};

export async function getAQIData(
  lat: number,
  lng: number
): Promise<number | null> {
  try {
    const response = await fetch(
      `https://api.waqi.info/feed/geo:${lat};${lng}/?token=${WAQI_TOKEN}`
    );
    const data = await response.json();

    if (data.status === "ok") {
      return data.data.aqi;
    }
    return null;
  } catch (error) {
    console.error("Error fetching AQI data:", error);
    return null;
  }
}

export async function searchNearbyStations(
  lat: number,
  lng: number,
  radius: number = 50
): Promise<Location[]> {
  try {
    const response = await fetch(
      `https://api.waqi.info/map/bounds/?token=${WAQI_TOKEN}&latlng=${lat - radius},${lng - radius},${lat + radius},${lng + radius}`
    );
    const data = await response.json();

    if (data.status === "ok") {
      return data.data.map((station: WAQIStation) => ({
        name: station.station.name,
        position: {
          lat: station.lat,
          lng: station.lon,
        },
        aqi: station.aqi,
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching nearby stations:", error);
    return [];
  }
}

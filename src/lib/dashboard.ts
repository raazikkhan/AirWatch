import { AQI } from "@/interfaces/aqi";
import { getAQIData } from "@/lib/map-data";

const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    console.error("Geolocation is not supported by your browser");
    return;
  }

  return new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });
  });
};

const getLocationName = async (lat: number, lng: number) => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) {
      return `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
    }

    const data = await response.json();

    if (data && data.name) {
      const cityName = data.name;
      const countryCode = data.sys?.country;
      return countryCode ? `${cityName}, ${countryCode}` : cityName;
    }

    return `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
  } catch (error) {
    console.error("Error getting location name:", error);
    return `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
  }
};

const fetchWeatherData = async (lat: number, lng: number) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}&units=metric`
    );

    if (!response.ok) {
      throw new Error(`OpenWeather API returned status: ${response.status}`);
    }

    const data = await response.json();
    return {
      temperature: Math.round(data.main?.temp) || 0,
      humidity: data.main?.humidity || 0,
      windSpeed: Math.round((data.wind?.speed || 0) * 3.6),
      visibility: Math.round((data.visibility || 0) / 1000),
      pressure: data.main?.pressure || 0,
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return {
      temperature: 0,
      humidity: 0,
      windSpeed: 0,
      visibility: 0,
      pressure: 0,
    };
  }
};

const fetchAQIData = async (
  setLocation: (location: { lat: number; lng: number; name: string }) => void,
  setAqiData: (data: AQI) => void,
  setLoading?: (loading: boolean) => void
) => {
  setLoading?.(true);
  try {
    const position = await getCurrentLocation();
    if (!position) {
      throw new Error("Could not get current location");
    }

    const { latitude: lat, longitude: lng } = position.coords;

    const name = await getLocationName(lat, lng);
    setLocation({ lat, lng, name });

    const weatherData = await fetchWeatherData(lat, lng);
    if (!weatherData) {
      throw new Error("Could not fetch weather data");
    }

    const aqi = await getAQIData(lat, lng);

    if (aqi !== null) {
      try {
        const response = await fetch(
          `https://api.waqi.info/feed/geo:${lat};${lng}/?token=${process.env.NEXT_PUBLIC_WAQI_API_TOKEN}`
        );

        if (!response.ok) {
          throw new Error(`WAQI API returned status: ${response.status}`);
        }

        const data = await response.json();

        if (!data || data.status !== "ok" || !data.data) {
          throw new Error("Invalid WAQI data structure");
        }

        const iaqi = data.data.iaqi || {};
        const time = data.data.time?.iso
          ? new Date(data.data.time.iso).getTime()
          : Date.now();

        const hourlyHistory = Array.from({ length: 24 }, (_, i) => {
          const hourTimestamp = time - (24 - i) * 60 * 60 * 1000;
          return {
            aqi: Math.round(aqi * (1 + Math.sin((i * Math.PI) / 12) * 0.1)),
            timestamp: hourTimestamp,
          };
        }).sort((a, b) => b.timestamp - a.timestamp);

        const currentDay = new Date(time);
        currentDay.setHours(0, 0, 0, 0);

        const dailyHistory = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(currentDay);
          date.setDate(currentDay.getDate() - (i + 1));
          return {
            aqi: Math.round(aqi * (0.8 + Math.random() * 0.4)),
            timestamp: date.getTime(),
          };
        }).sort((a, b) => b.timestamp - a.timestamp);

        const currentDate = new Date(time);
        currentDate.setHours(0, 0, 0, 0);
        const daysToMonday = (currentDate.getDay() + 6) % 7;
        currentDate.setDate(currentDate.getDate() - daysToMonday);

        const weeklyHistory = Array.from({ length: 4 }, (_, i) => {
          const date = new Date(currentDate);
          date.setDate(date.getDate() - i * 7);
          return {
            aqi: Math.round(aqi * (0.85 + Math.random() * 0.3)),
            timestamp: date.getTime(),
          };
        }).sort((a, b) => b.timestamp - a.timestamp);

        setAqiData({
          aqi,
          pm25: iaqi.pm25?.v || 0,
          pm10: iaqi.pm10?.v || 0,
          no2: iaqi.no2?.v || 0,
          o3: iaqi.o3?.v || 0,
          so2: iaqi.so2?.v || 0,
          co: iaqi.co?.v || 0,
          visibility: weatherData.visibility || 0,
          pressure: weatherData.pressure || 0,
          lastUpdated: time,
          hourlyHistory,
          dailyHistory,
          weeklyHistory,
        });
      } catch (apiError) {
        console.error("Error fetching WAQI data:", apiError);
        throw apiError;
      }
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    setAqiData({
      aqi: 0,
      pm25: 0,
      pm10: 0,
      no2: 0,
      o3: 0,
      so2: 0,
      co: 0,
      visibility: 0,
      pressure: 0,
      lastUpdated: Date.now(),
      hourlyHistory: [],
      dailyHistory: [],
      weeklyHistory: [],
    });
  }
  setLoading?.(false);
};

const fetchAQIDataWithParams = async (
  location: { lat: number; lng: number },
  setAqiData: (data: AQI) => void,
  setLoading?: (loading: boolean) => void
) => {
  const { lat, lng } = location;
  setLoading?.(true);

  try {
    const weatherData = await fetchWeatherData(lat, lng);
    if (!weatherData) throw new Error("Could not fetch weather data");

    const aqi = await getAQIData(lat, lng);
    if (aqi === null) throw new Error("Could not fetch AQI");

    const response = await fetch(
      `https://api.waqi.info/feed/geo:${lat};${lng}/?token=${process.env.NEXT_PUBLIC_WAQI_API_TOKEN}`
    );

    if (!response.ok) throw new Error(`WAQI API error: ${response.status}`);

    const data = await response.json();
    if (!data || data.status !== "ok" || !data.data) {
      throw new Error("Invalid WAQI data format");
    }

    const iaqi = data.data.iaqi || {};
    const time = data.data.time?.iso
      ? new Date(data.data.time.iso).getTime()
      : Date.now();

    const hourlyHistory = Array.from({ length: 24 }, (_, i) => {
      const hourTimestamp = time - (24 - i) * 60 * 60 * 1000;
      return {
        aqi: Math.round(aqi * (1 + Math.sin((i * Math.PI) / 12) * 0.1)),
        timestamp: hourTimestamp,
      };
    }).sort((a, b) => b.timestamp - a.timestamp);

    const currentDay = new Date(time);
    currentDay.setHours(0, 0, 0, 0);

    const dailyHistory = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(currentDay);
      date.setDate(currentDay.getDate() - (i + 1));
      return {
        aqi: Math.round(aqi * (0.8 + Math.random() * 0.4)),
        timestamp: date.getTime(),
      };
    }).sort((a, b) => b.timestamp - a.timestamp);

    const currentDate = new Date(time);
    currentDate.setHours(0, 0, 0, 0);
    const daysToMonday = (currentDate.getDay() + 6) % 7;
    currentDate.setDate(currentDate.getDate() - daysToMonday);

    const weeklyHistory = Array.from({ length: 4 }, (_, i) => {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i * 7);
      return {
        aqi: Math.round(aqi * (0.85 + Math.random() * 0.3)),
        timestamp: date.getTime(),
      };
    }).sort((a, b) => b.timestamp - a.timestamp);

    setAqiData({
      aqi,
      pm25: iaqi.pm25?.v || 0,
      pm10: iaqi.pm10?.v || 0,
      no2: iaqi.no2?.v || 0,
      o3: iaqi.o3?.v || 0,
      so2: iaqi.so2?.v || 0,
      co: iaqi.co?.v || 0,
      visibility: weatherData.visibility || 0,
      pressure: weatherData.pressure || 0,
      lastUpdated: time,
      hourlyHistory,
      dailyHistory,
      weeklyHistory,
    });
  } catch (error) {
    console.error("Error fetching AQI with params:", error);
    setAqiData({
      aqi: 0,
      pm25: 0,
      pm10: 0,
      no2: 0,
      o3: 0,
      so2: 0,
      co: 0,
      visibility: 0,
      pressure: 0,
      lastUpdated: Date.now(),
      hourlyHistory: [],
      dailyHistory: [],
      weeklyHistory: [],
    });
  }

  setLoading?.(false);
};

export {
  fetchAQIData,
  fetchAQIDataWithParams,
  getCurrentLocation,
  getLocationName,
};

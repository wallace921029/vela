export interface WeatherData {
  temperature: number;
  weatherCode: number;
}

export interface LocationData {
  name: string;
  latitude: number;
  longitude: number;
}

import axios from 'axios';

export const fetchWeather = async (lat: number, lon: number): Promise<WeatherData | null> => {
  try {
    const response = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`);
    const data = response.data;
    if (data.current) {
      return {
        temperature: data.current.temperature_2m,
        weatherCode: data.current.weather_code,
      };
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch weather", error);
    return null;
  }
};

export const searchLocation = async (name: string, language: string = 'en'): Promise<LocationData | null> => {
  try {
    // Open-Meteo Geocoding API
    const response = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=${language}`);
    const data = response.data;
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        name: result.name,
        latitude: result.latitude,
        longitude: result.longitude,
      };
    }
    return null;
  } catch (error) {
    console.error("Failed to search location", error);
    return null;
  }
};

export const reverseGeocode = async (lat: number, lon: number, language: string = 'en'): Promise<string | null> => {
  try {
    // OpenStreetMap Nominatim for reverse geocoding
    // Nominatim requires a User-Agent, but in browser fetch we can't always set it easily without issues, 
    // though usually standard fetch works if not abused.
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=${language}`);
    const data = response.data;
    
    if (data.address) {
      // Prefer city, town, village, then fallback to others
      return data.address.city || data.address.town || data.address.village || data.address.county || data.address.state || "Local";
    }
    return null;
  } catch (error) {
    console.error("Failed to reverse geocode", error);
    return null;
  }
};

export const getWeatherDescription = (code: number, t: any): string => {
  // Map WMO codes to translation keys
  if (code === 0) return t('weather.clearSky', 'Clear sky');
  if (code === 1 || code === 2 || code === 3) return t('weather.cloudy', 'Cloudy');
  if (code === 45 || code === 48) return t('weather.fog', 'Fog');
  if (code >= 51 && code <= 57) return t('weather.drizzle', 'Drizzle');
  if (code >= 61 && code <= 67) return t('weather.rain', 'Rain');
  if (code >= 71 && code <= 77) return t('weather.snow', 'Snow');
  if (code >= 80 && code <= 82) return t('weather.showers', 'Showers');
  if (code >= 85 && code <= 86) return t('weather.snowShowers', 'Snow showers');
  if (code >= 95 && code <= 99) return t('weather.thunderstorm', 'Thunderstorm');
  return t('weather.unknown', 'Unknown');
};

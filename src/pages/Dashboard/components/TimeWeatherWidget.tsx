import { useState, useEffect } from 'react';
import { CloudSun, MapPin, Navigation, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { fetchWeather, searchLocation, reverseGeocode, getWeatherDescription } from '@/utils/weather';
import type { WeatherData } from '@/utils/weather';

const WEATHER_LOCATION_KEY = 'vela_weather_location';
const WEATHER_CACHE_KEY = 'vela_weather_cache';
const WEATHER_LAST_REFRESH_KEY = 'vela_weather_last_refresh';
const WEATHER_CACHE_TTL = 30 * 60 * 1000;
const WEATHER_REFRESH_COOLDOWN = 60 * 1000;

interface SavedWeatherLocation {
  lat: number;
  lon: number;
  name: string;
}

interface CachedWeather {
  lat: number;
  lon: number;
  timestamp: number;
  data: WeatherData;
}

const coordinatesMatch = (a: { lat: number; lon: number }, b: { lat: number; lon: number }) =>
  Math.abs(a.lat - b.lat) < 0.000001 && Math.abs(a.lon - b.lon) < 0.000001;

const readSavedLocation = (): SavedWeatherLocation | null => {
  try {
    const saved = localStorage.getItem(WEATHER_LOCATION_KEY);
    if (!saved) {
      return null;
    }

    const location = JSON.parse(saved) as SavedWeatherLocation;
    if (typeof location.lat !== 'number' || typeof location.lon !== 'number') {
      return null;
    }

    return location;
  } catch (e) {
    console.error("Failed to parse saved location", e);
    return null;
  }
};

const readFreshWeatherCache = (location: SavedWeatherLocation): WeatherData | null => {
  try {
    const saved = localStorage.getItem(WEATHER_CACHE_KEY);
    if (!saved) {
      return null;
    }

    const cache = JSON.parse(saved) as CachedWeather;
    const isFresh = Date.now() - cache.timestamp < WEATHER_CACHE_TTL;
    if (isFresh && coordinatesMatch(location, cache)) {
      return cache.data;
    }

    return null;
  } catch (e) {
    console.error("Failed to parse cached weather", e);
    return null;
  }
};

const writeWeatherCache = (location: SavedWeatherLocation, data: WeatherData | null) => {
  if (!data) {
    return;
  }

  localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({
    lat: location.lat,
    lon: location.lon,
    timestamp: Date.now(),
    data,
  }));
};

const TimeWeatherWidget = () => {
  const { t, i18n } = useTranslation();
  const [time, setTime] = useState(new Date());

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLocation, setWeatherLocation] = useState<SavedWeatherLocation | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWeatherRefreshing, setIsWeatherRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const savedLocation = readSavedLocation();
    if (!savedLocation) {
      return;
    }

    setWeatherLocation(savedLocation);
    setLocationName(savedLocation.name);

    const cachedWeather = readFreshWeatherCache(savedLocation);
    if (cachedWeather) {
      setWeather(cachedWeather);
      return;
    }

    setIsWeatherRefreshing(true);
    fetchWeather(savedLocation.lat, savedLocation.lon)
      .then(data => {
        if (data) {
          setWeather(data);
          writeWeatherCache(savedLocation, data);
        }
      })
      .finally(() => setIsWeatherRefreshing(false));
  }, []);

  const timeString = time.toLocaleTimeString(i18n.language === 'zh' ? 'zh-CN' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  const dateString = time.toLocaleDateString(i18n.language === 'zh' ? 'zh-CN' : 'en-US', { month: 'long', day: 'numeric', weekday: 'long' });

  const handleBrowserLocation = () => {
    setIsLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          try {
            const [weatherData, locName] = await Promise.all([
              fetchWeather(lat, lon),
              reverseGeocode(lat, lon, i18n.language)
            ]);
            
            setWeather(weatherData);
            const finalName = locName || t('weather.unknown');
            setLocationName(finalName);
            const location = { lat, lon, name: finalName };
            setWeatherLocation(location);
            localStorage.setItem(WEATHER_LOCATION_KEY, JSON.stringify(location));
            writeWeatherCache(location, weatherData);
            setIsOpen(false);
          } catch (e) {
            console.error(e);
          } finally {
            setIsLoading(false);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLoading(false);
        }
      );
    } else {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = z.object({
      searchQuery: z.string().trim().min(1),
    }).safeParse({ searchQuery });

    if (!result.success) return;
    
    setIsLoading(true);
    try {
      const locationData = await searchLocation(result.data.searchQuery, i18n.language);
      if (locationData) {
        const weatherData = await fetchWeather(locationData.latitude, locationData.longitude);
        setWeather(weatherData);
        setLocationName(locationData.name);
        const location = {
          lat: locationData.latitude, 
          lon: locationData.longitude, 
          name: locationData.name 
        };
        setWeatherLocation(location);
        localStorage.setItem(WEATHER_LOCATION_KEY, JSON.stringify(location));
        writeWeatherCache(location, weatherData);
        setIsOpen(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWeatherRefresh = async () => {
    if (!weatherLocation || isWeatherRefreshing) {
      return;
    }

    const lastRefresh = Number(localStorage.getItem(WEATHER_LAST_REFRESH_KEY) || 0);
    if (Date.now() - lastRefresh < WEATHER_REFRESH_COOLDOWN) {
      return;
    }

    localStorage.setItem(WEATHER_LAST_REFRESH_KEY, String(Date.now()));
    setIsWeatherRefreshing(true);

    try {
      const data = await fetchWeather(weatherLocation.lat, weatherLocation.lon);
      if (data) {
        setWeather(data);
        writeWeatherCache(weatherLocation, data);
      }
    } finally {
      setIsWeatherRefreshing(false);
    }
  };

  const displayLocation = locationName || t('weather.unknown');
  const weatherDesc = weather ? getWeatherDescription(weather.weatherCode, t) : t('weather.unknown');
  const tempStr = weather ? `${Math.round(weather.temperature)}°C` : '';

  const [timeSize, setTimeSize] = useState<'comfortable' | 'compact'>('comfortable');
  const [showWeather, setShowWeather] = useState(true);

  useEffect(() => {
    const handleSettingsUpdate = () => {
      setTimeSize((localStorage.getItem('vela_time_size') as 'comfortable' | 'compact') || 'comfortable');
      setShowWeather(localStorage.getItem('vela_show_weather') !== 'false');
    };

    handleSettingsUpdate();
    window.addEventListener('vela_settings_updated', handleSettingsUpdate);
    return () => window.removeEventListener('vela_settings_updated', handleSettingsUpdate);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-6 pt-10 pb-8 animate-in fade-in zoom-in duration-700">
      <div className={`${timeSize === 'compact' ? 'text-5xl md:text-6xl' : 'text-7xl md:text-8xl'} font-black tracking-tighter text-neutral-800 dark:text-neutral-100 drop-shadow-sm font-sans select-none transition-all duration-300`}>
        {timeString}
      </div>
      
      {showWeather && (
        <div className="flex items-center gap-4 md:gap-6 text-neutral-500 dark:text-neutral-400 font-medium text-sm md:text-base transition-all duration-300 animate-in fade-in slide-in-from-top-4">
          <span>{dateString}</span>
          <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700"></div>
          <button
            type="button"
            className="flex items-center gap-2 rounded-md outline-none transition-colors hover:text-neutral-800 focus-visible:ring-2 focus-visible:ring-primary/40 dark:hover:text-neutral-200"
            onClick={handleWeatherRefresh}
            title={t('weather.refreshWeather')}
            aria-label={t('weather.refreshWeather')}
            disabled={!weatherLocation || isWeatherRefreshing}
          >
            {isWeatherRefreshing ? (
              <Loader2 className="size-5 animate-spin text-amber-500" />
            ) : (
              <CloudSun className="size-5 text-amber-500" />
            )}
            <span>{weatherDesc} {tempStr}</span>
          </button>
          <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700"></div>
          
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1.5 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors cursor-pointer outline-none">
                <MapPin className="size-4" />
                <span>{displayLocation}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="center">
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={handleBrowserLocation}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Navigation className="mr-2 h-4 w-4" />}
                {t('weather.useBrowserLocation')}
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-neutral-200 dark:border-neutral-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {t('common.or')}
                  </span>
                </div>
              </div>
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input 
                  placeholder={t('weather.searchCity')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isLoading}
                  className="h-9"
                />
                <Button type="submit" size="sm" disabled={isLoading || !searchQuery.trim()} className="h-9">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('common.search')}
                </Button>
              </form>
            </div>
          </PopoverContent>
        </Popover>

      </div>
      )}
    </div>
  );
};

export default TimeWeatherWidget;

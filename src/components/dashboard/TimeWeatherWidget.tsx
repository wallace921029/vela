import { useState, useEffect } from 'react';
import { CloudSun, MapPin, Navigation, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { fetchWeather, searchLocation, reverseGeocode, getWeatherDescription } from '../../utils/weather';
import type { WeatherData } from '../../utils/weather';

const WEATHER_LOCATION_KEY = 'vela_weather_location';

const TimeWeatherWidget = () => {
  const { t, i18n } = useTranslation();
  const [time, setTime] = useState(new Date());

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load saved location on mount
  useEffect(() => {
    const saved = localStorage.getItem(WEATHER_LOCATION_KEY);
    if (saved) {
      try {
        const { lat, lon, name } = JSON.parse(saved);
        if (lat !== undefined && lon !== undefined) {
          setLocationName(name); // Set eagerly
          fetchWeather(lat, lon).then(data => {
            if (data) setWeather(data);
          });
        }
      } catch (e) {
        console.error("Failed to parse saved location", e);
      }
    }
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
            localStorage.setItem(WEATHER_LOCATION_KEY, JSON.stringify({ lat, lon, name: finalName }));
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
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const locationData = await searchLocation(searchQuery, i18n.language);
      if (locationData) {
        const weatherData = await fetchWeather(locationData.latitude, locationData.longitude);
        setWeather(weatherData);
        setLocationName(locationData.name);
        localStorage.setItem(WEATHER_LOCATION_KEY, JSON.stringify({ 
          lat: locationData.latitude, 
          lon: locationData.longitude, 
          name: locationData.name 
        }));
        setIsOpen(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const displayLocation = locationName || t('weather.unknown');
  const weatherDesc = weather ? getWeatherDescription(weather.weatherCode, t) : t('weather.unknown');
  const tempStr = weather ? `${Math.round(weather.temperature)}°C` : '';

  return (
    <div className="flex flex-col items-center justify-center space-y-6 pt-10 pb-8 animate-in fade-in zoom-in duration-700">
      <div className="text-7xl md:text-8xl font-black tracking-tighter text-neutral-800 dark:text-neutral-100 drop-shadow-sm font-sans select-none">
        {timeString}
      </div>
      <div className="flex items-center gap-4 md:gap-6 text-neutral-500 dark:text-neutral-400 font-medium text-sm md:text-base">
        <span>{dateString}</span>
        <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700"></div>
        <div className="flex items-center gap-2">
          <CloudSun className="size-5 text-amber-500" />
          <span>{weatherDesc} {tempStr}</span>
        </div>
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
    </div>
  );
};

export default TimeWeatherWidget;

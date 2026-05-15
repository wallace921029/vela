import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, Clock, CloudSun, ExternalLink, Link } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

export const DashboardSettings = () => {
  const { t } = useTranslation();
  
  const [timeSize, setTimeSize] = useState<'comfortable' | 'compact'>('comfortable');
  const [showWeather, setShowWeather] = useState(true);
  const [searchTarget, setSearchTarget] = useState<'_blank' | '_self'>('_blank');
  const [navTarget, setNavTarget] = useState<'_blank' | '_self'>('_blank');

  useEffect(() => {
    setTimeSize((localStorage.getItem('vela_time_size') as 'comfortable' | 'compact') || 'comfortable');
    setShowWeather(localStorage.getItem('vela_show_weather') !== 'false');
    setSearchTarget((localStorage.getItem('vela_search_target') as '_blank' | '_self') || '_blank');
    setNavTarget((localStorage.getItem('vela_nav_target') as '_blank' | '_self') || '_blank');
  }, []);

  const updateSetting = (key: string, value: string) => {
    localStorage.setItem(key, value);
    window.dispatchEvent(new Event('vela_settings_updated'));
  };

  return (
    <div className="absolute top-6 right-6 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300">
            <Settings className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 p-2 rounded-xl">
          <DropdownMenuLabel className="font-normal text-xs text-neutral-500 uppercase tracking-wider mb-2">
            {t('dashboard.settings')}
          </DropdownMenuLabel>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="size-4 opacity-70" />
                <span>{t('dashboard.timeComfortable')}</span>
              </div>
              <Switch 
                checked={timeSize === 'comfortable'} 
                onCheckedChange={(checked) => {
                  const val = checked ? 'comfortable' : 'compact';
                  setTimeSize(val);
                  updateSetting('vela_time_size', val);
                }} 
              />
            </div>

            <div className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              <div className="flex items-center gap-2 text-sm">
                <CloudSun className="size-4 opacity-70" />
                <span>{t('dashboard.showWeather')}</span>
              </div>
              <Switch 
                checked={showWeather} 
                onCheckedChange={(checked) => {
                  setShowWeather(checked);
                  updateSetting('vela_show_weather', checked.toString());
                }} 
              />
            </div>

            <DropdownMenuSeparator className="my-2" />

            <div className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              <div className="flex items-center gap-2 text-sm">
                <ExternalLink className="size-4 opacity-70" />
                <span>{t('dashboard.searchNewTab')}</span>
              </div>
              <Switch 
                checked={searchTarget === '_blank'} 
                onCheckedChange={(checked) => {
                  const val = checked ? '_blank' : '_self';
                  setSearchTarget(val);
                  updateSetting('vela_search_target', val);
                }} 
              />
            </div>

            <div className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              <div className="flex items-center gap-2 text-sm">
                <Link className="size-4 opacity-70" />
                <span>{t('dashboard.navNewTab')}</span>
              </div>
              <Switch 
                checked={navTarget === '_blank'} 
                onCheckedChange={(checked) => {
                  const val = checked ? '_blank' : '_self';
                  setNavTarget(val);
                  updateSetting('vela_nav_target', val);
                }} 
              />
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
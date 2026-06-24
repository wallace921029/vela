import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, Clock, CloudSun, ExternalLink, Link, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  FAVICON_SERVICE_OPTIONS,
  FAVICON_SERVICE_STORAGE_KEY,
  type FaviconService,
  normalizeFaviconService,
} from '@/utils/favicon';

const readSetting = <T extends string>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  return (localStorage.getItem(key) as T) || fallback;
};

export const DashboardSettings = () => {
  const { t } = useTranslation();
  
  const [timeSize, setTimeSize] = useState<'comfortable' | 'compact'>(() =>
    readSetting<'comfortable' | 'compact'>('vela_time_size', 'comfortable'),
  );
  const [showWeather, setShowWeather] = useState(() =>
    typeof window === 'undefined' ? true : localStorage.getItem('vela_show_weather') !== 'false',
  );
  const [searchTarget, setSearchTarget] = useState<'_blank' | '_self'>(() =>
    readSetting<'_blank' | '_self'>('vela_search_target', '_blank'),
  );
  const [navTarget, setNavTarget] = useState<'_blank' | '_self'>(() =>
    readSetting<'_blank' | '_self'>('vela_nav_target', '_blank'),
  );
  const [faviconService, setFaviconService] = useState<FaviconService>(() =>
    normalizeFaviconService(
      typeof window === 'undefined' ? null : localStorage.getItem(FAVICON_SERVICE_STORAGE_KEY),
    ),
  );

  const updateSetting = (key: string, value: string, reload = false) => {
    localStorage.setItem(key, value);
    if (reload) {
      window.location.reload();
    } else {
      window.dispatchEvent(new Event('vela_settings_updated'));
    }
  };

  return (
    <div className="absolute top-6 right-6 z-50 hidden md:block">
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

            <DropdownMenuSeparator className="my-2" />

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="px-2 py-1.5 rounded-lg text-sm flex items-center gap-2 cursor-pointer">
                <Globe className="size-4 opacity-70" />
                <span>{t('dashboard.faviconService')}</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-56 rounded-xl">
                <DropdownMenuRadioGroup value={faviconService} onValueChange={(val) => {
                  const nextValue = normalizeFaviconService(val);
                  setFaviconService(nextValue);
                  updateSetting(FAVICON_SERVICE_STORAGE_KEY, nextValue, true);
                }}>
                  {FAVICON_SERVICE_OPTIONS.map((option) => (
                    <DropdownMenuRadioItem key={option.id} value={option.id} className="cursor-pointer">
                      {t(option.labelKey)}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

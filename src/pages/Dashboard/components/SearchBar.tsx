import { useState, useEffect, useRef } from 'react';
import { Search, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import GoogleIcon from '@/assets/google.svg';
import BingIcon from '@/assets/bing.svg';
import BaiduIcon from '@/assets/baidu.svg';

const ENGINES = [
  { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=', icon: GoogleIcon },
  { id: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q=', icon: BingIcon },
  { id: 'baidu', name: 'Baidu', url: 'https://www.baidu.com/s?wd=', icon: BaiduIcon },
];

const STORAGE_KEY = 'vela_search_engine';

const SearchBar = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [engineId, setEngineId] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && ENGINES.find(e => e.id === saved) ? saved : 'google';
  });
  const [switching, setSwitching] = useState(false);
  const isIconClickedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on desktop only (avoid popping keyboard on mobile)
  useEffect(() => {
    if (!window.matchMedia('(max-width: 767px)').matches) {
      inputRef.current?.focus();
    }
  }, []);

  const currentEngine = ENGINES.find(e => e.id === engineId) || ENGINES[0];

  const switchEngine = (id: string) => {
    if (id === engineId) return;
    setSwitching(true);
    setTimeout(() => {
      setEngineId(id);
      localStorage.setItem(STORAGE_KEY, id);
      setSwitching(false);
    }, 150);
  };

  const cycleEngine = () => {
    const idx = ENGINES.findIndex(e => e.id === engineId);
    switchEngine(ENGINES[(idx + 1) % ENGINES.length].id);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const isIconClicked = isIconClickedRef.current;
    isIconClickedRef.current = false;

    const target = localStorage.getItem('vela_search_target') === '_self' ? '_self' : '_blank';
    let trimmedQuery = query.trim();
    let searchEngineUrl = currentEngine.url;
    let wasSlashCommandOnly = false;

    const match = trimmedQuery.match(/^\/(google|bing|baidu)(?:\s+(.*))?$/i);
    if (match) {
      const matchedEngineId = match[1].toLowerCase();
      trimmedQuery = match[2] ? match[2].trim() : '';
      const matchedEngine = ENGINES.find(e => e.id === matchedEngineId);
      if (matchedEngine) {
        searchEngineUrl = matchedEngine.url;
      }
      if (!trimmedQuery) {
        wasSlashCommandOnly = true;
        if (matchedEngine) {
          switchEngine(matchedEngine.id);
        }
      }
    }

    if (!trimmedQuery) {
      if (wasSlashCommandOnly && !isIconClicked) {
        setQuery('');
        return;
      }
      try {
        const urlObj = new URL(searchEngineUrl);
        window.open(urlObj.origin, target);
      } catch {
        window.open(searchEngineUrl, target);
      }
      setQuery('');
      return;
    }

    window.open(`${searchEngineUrl}${encodeURIComponent(trimmedQuery)}`, target);
    setQuery('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto pb-4 md:pb-16 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
      <form onSubmit={handleSearch} className="relative group flex items-center">
        {/* Engine Switcher — leftmost, click to cycle with animation */}
        <button
          type="button"
          onClick={cycleEngine}
          className="absolute left-1.5 md:left-2 z-10 w-9 h-9 md:w-12 md:h-12 flex items-center justify-center rounded-full hover:bg-primary/10 transition-colors"
          title={t('search.switchEngine', { engine: currentEngine.name })}
        >
          <img
            src={currentEngine.icon}
            alt={currentEngine.name}
            className={`w-4 h-4 md:w-5 md:h-5 object-contain transition-all duration-150 ease-in-out ${
              switching ? 'scale-50 opacity-0 rotate-90' : 'scale-100 opacity-100 rotate-0'
            }`}
          />
        </button>

        {/* Search Input — no placeholder */}
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-12 md:h-16 pl-11 md:pl-14 pr-20 md:pr-[6.5rem] rounded-full bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 focus-visible:ring-0 focus-visible:border-primary/50 text-base md:text-lg shadow-sm hover:shadow-md focus:shadow-lg transition-all"
        />

        {/* Right controls: Info icon + Search button */}
        <div className="absolute right-1.5 md:right-2 flex items-center">
          {/* Info icon with command tips tooltip */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="w-9 h-9 md:w-12 md:h-12 flex items-center justify-center rounded-full text-neutral-300 dark:text-neutral-600 hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <Info className="size-3.5 md:size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                sideOffset={8}
                className="w-64 max-w-[calc(100vw-2rem)] flex-col items-start gap-2 p-3 text-left leading-relaxed whitespace-normal break-words"
              >
                <p className="font-medium">{t('search.tipsTitle')}</p>
                <p className="w-full rounded-sm bg-background/10 px-2 py-1 font-mono text-[11px] leading-5 opacity-90">
                  /google
                  <br />
                  /bing
                  <br />
                  /baidu
                </p>
                <p className="opacity-80">{t('search.tipsCycle')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Search submit button */}
          <button
            type="submit"
            onPointerDown={() => { isIconClickedRef.current = true; }}
            className="w-9 h-9 md:w-12 md:h-12 flex items-center justify-center rounded-full text-neutral-400 hover:text-primary hover:bg-primary/10 transition-colors"
            title={t('search.submit')}
          >
            <Search className="size-4 md:size-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
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
  const [engineId, setEngineId] = useState('google');
  const isIconClickedRef = useRef(false);

  // Load saved search engine
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && ENGINES.find(e => e.id === saved)) {
      setEngineId(saved);
    }
  }, []);

  const currentEngine = ENGINES.find(e => e.id === engineId) || ENGINES[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isIconClicked = isIconClickedRef.current;
    isIconClickedRef.current = false; // reset immediately

    const target = localStorage.getItem('vela_search_target') === '_self' ? '_self' : '_blank';
    let trimmedQuery = query.trim();
    let searchEngineUrl = currentEngine.url;
    let wasSlashCommandOnly = false;

    // Handle if they submit `/google` directly or `/google test`
    const match = trimmedQuery.match(/^\/(google|bing|baidu)(?:\s+(.*))?$/i);
    if (match) {
      const matchedEngineId = match[1].toLowerCase();
      trimmedQuery = match[2] ? match[2].trim() : '';
      const matchedEngine = ENGINES.find(e => e.id === matchedEngineId);
      if (matchedEngine) {
        searchEngineUrl = matchedEngine.url;
        changeEngine(matchedEngine.id);
      }
      if (!trimmedQuery) {
        wasSlashCommandOnly = true;
      }
    }
    
    if (!trimmedQuery) {
      if (wasSlashCommandOnly && !isIconClicked) {
        // Just switched engine via Enter without text. Don't open page.
        setQuery('');
        return;
      }

      try {
        const urlObj = new URL(searchEngineUrl);
        window.open(urlObj.origin, target);
      } catch (err) {
        // Fallback if URL parsing fails
        window.open(searchEngineUrl, target);
      }
      setQuery('');
      return;
    }

    window.open(`${searchEngineUrl}${encodeURIComponent(trimmedQuery)}`, target);
    setQuery('');
  };

  const changeEngine = (id: string) => {
    setEngineId(id);
    localStorage.setItem(STORAGE_KEY, id);
  };

  return (
    <div className="w-full max-w-2xl mx-auto pb-16 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
      <form onSubmit={handleSearch} className="relative group flex items-center">
        {/* Engine Switcher (Small icons at top-left) */}
        <div className="absolute top-2 left-7 z-10 flex items-center gap-2">
          {ENGINES.map(engine => (
            <button
              key={engine.id}
              type="button"
              onClick={() => changeEngine(engine.id)}
              className={`flex items-center justify-center transition-all duration-200 outline-none ${
                engine.id === engineId 
                  ? 'opacity-100 drop-shadow-sm' 
                  : 'opacity-30 hover:opacity-80 grayscale hover:grayscale-0'
              }`}
              title={engine.name}
            >
              <img src={engine.icon} alt={engine.name} className="w-3.5 h-3.5 object-contain" />
            </button>
          ))}
        </div>
        
        {/* Search Input */}
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('search.placeholder', { engine: currentEngine.name })}
          className="w-full h-16 pl-7 pr-14 pt-3 rounded-full bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 focus-visible:ring-0 focus-visible:border-primary/50 text-lg shadow-sm hover:shadow-md focus:shadow-lg transition-all"
        />

        {/* Search Button */}
        <button
          type="submit"
          onPointerDown={() => { isIconClickedRef.current = true; }}
          className="absolute right-2 w-12 h-12 flex items-center justify-center rounded-full text-neutral-400 hover:text-primary hover:bg-primary/10 transition-colors"
          title={t('search.placeholder', { engine: currentEngine.name })}
        >
          <Search className="size-5" />
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
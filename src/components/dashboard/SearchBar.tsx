import { useState, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FaviconImage } from './FaviconImage';

const ENGINES = [
  { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=' },
  { id: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q=' },
  { id: 'baidu', name: 'Baidu', url: 'https://www.baidu.com/s?wd=' },
];

const STORAGE_KEY = 'vela_search_engine';

const SearchBar = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [engineId, setEngineId] = useState('google');

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
    if (query.trim()) {
      window.open(`${currentEngine.url}${encodeURIComponent(query)}`, '_blank');
      setQuery('');
    }
  };

  const changeEngine = (id: string) => {
    setEngineId(id);
    localStorage.setItem(STORAGE_KEY, id);
  };

  return (
    <div className="w-full max-w-2xl mx-auto pb-16 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
      <form onSubmit={handleSearch} className="relative group flex items-center">
        {/* Engine Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              type="button"
              className="absolute left-2 z-10 flex items-center gap-1.5 h-12 px-3 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-primary transition-colors outline-none"
              title="切换搜索引擎"
            >
              <span className="w-6 h-6 flex items-center justify-center overflow-hidden bg-neutral-200 dark:bg-neutral-700 rounded-full text-neutral-700 dark:text-neutral-300">
                <FaviconImage url={currentEngine.url} title={currentEngine.name} className="text-xs" />
              </span>
              <ChevronDown className="size-3.5 opacity-50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-32 rounded-xl">
            {ENGINES.map(engine => (
              <DropdownMenuItem 
                key={engine.id} 
                onClick={() => changeEngine(engine.id)}
                className={`cursor-pointer rounded-lg ${engine.id === engineId ? "bg-primary/10 text-primary font-medium" : ""}`}
              >
                <span className="w-5 h-5 flex items-center justify-center overflow-hidden bg-neutral-100 dark:bg-neutral-800 rounded mr-2">
                  <FaviconImage url={engine.url} title={engine.name} className="text-[10px]" />
                </span>
                {engine.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Search Input */}
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('search.placeholder', { engine: currentEngine.name })}
          className="w-full h-16 pl-20 pr-14 rounded-full bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 focus-visible:ring-0 focus-visible:border-primary/50 text-lg shadow-sm hover:shadow-md focus:shadow-lg transition-all"
        />

        {/* Search Button */}
        <button
          type="submit"
          className="absolute right-2 w-12 h-12 flex items-center justify-center rounded-full text-neutral-400 hover:text-primary hover:bg-primary/10 transition-colors"
          title="搜索"
        >
          <Search className="size-5" />
        </button>
      </form>
    </div>
  );
};

export default SearchBar;

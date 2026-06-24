import { useState, useMemo } from 'react';
import {
  FAVICON_SERVICE_STORAGE_KEY,
  getFaviconServiceUrl,
  normalizeFaviconService,
} from '@/utils/favicon';

export const FaviconImage = ({ src, title, url, className = "" }: { src?: string, title: string, url: string, className?: string }) => {
  const [errorCount, setErrorCount] = useState(0);
  
  const domain = useMemo(() => {
    try {
      const u = /^https?:\/\//i.test(url) ? url : `https://${url}`;
      return new URL(u).hostname;
    } catch {
      return '';
    }
  }, [url]);

  const sources = useMemo(() => {
    const list = [];
    if (src) list.push(src);
    if (domain) {
      const service = normalizeFaviconService(localStorage.getItem(FAVICON_SERVICE_STORAGE_KEY));
      const targetUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
      list.push(getFaviconServiceUrl(service, targetUrl, domain));
    }
    return list;
  }, [src, domain, url]);

  if (!domain && !src || errorCount >= sources.length) {
    return <span className={`text-xl font-bold text-neutral-500 ${className}`}>{title.charAt(0).toUpperCase()}</span>;
  }

  return (
    <img 
      src={sources[errorCount]} 
      alt={title} 
      className={`w-full h-full object-cover bg-white ${className}`}
      onError={() => setErrorCount(c => c + 1)}
    />
  );
};

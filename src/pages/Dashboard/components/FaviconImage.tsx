import { useState, useMemo } from 'react';

const faviconServices = {
  'favicon-im': (_url: string, domain: string) => `https://favicon.im/${domain}?larger=true`,
  'google': (url: string) => `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&size=48&url=${encodeURIComponent(url)}`
};

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
      let serviceKey = localStorage.getItem('vela_favicon_service');
      if (serviceKey === 'google-mirror' || !serviceKey) {
        serviceKey = 'favicon-im';
      }
      const service = faviconServices[serviceKey as keyof typeof faviconServices] || faviconServices['favicon-im'];
      const targetUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
      list.push(service(targetUrl, domain));
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

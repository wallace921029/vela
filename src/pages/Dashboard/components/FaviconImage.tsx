import { useState, useMemo } from 'react';

const faviconServices = [
  (domain: string) => `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
  (domain: string) => `https://icon.horse/icon/${domain}`,
  (domain: string) => `https://favicons.githubusercontent.com/${domain}`,
  (domain: string) => `https://${domain}/favicon.ico`,
];

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
      list.push(...faviconServices.map((service) => service(domain)));
    }
    return list;
  }, [src, domain]);

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

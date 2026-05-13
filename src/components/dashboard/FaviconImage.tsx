import { useState, useMemo } from 'react';

export const FaviconImage = ({ src, title, url, className = "" }: { src?: string, title: string, url: string, className?: string }) => {
  const [errorCount, setErrorCount] = useState(0);
  
  const domain = useMemo(() => {
    try {
      const u = url.startsWith('http') ? url : `https://${url}`;
      return new URL(u).hostname;
    } catch {
      return '';
    }
  }, [url]);

  const sources = useMemo(() => {
    const list = [];
    if (src) list.push(src);
    if (domain) {
      list.push(`https://favicon.im/${domain}`);
      list.push(`https://api.vvhan.com/api/ico?url=${domain}`);
      list.push(`https://favicon.yandex.net/favicon/${domain}`);
      list.push(`https://${domain}/favicon.ico`);
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

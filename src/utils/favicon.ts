export const FAVICON_SERVICE_STORAGE_KEY = 'vela_favicon_service';

export const FAVICON_SERVICE_IDS = [
  'google-v2',
  'google-v1',
  'yandex',
  'duckduckgo',
  'bitwarden',
] as const;

export type FaviconService = (typeof FAVICON_SERVICE_IDS)[number];

export const DEFAULT_FAVICON_SERVICE: FaviconService = 'google-v2';

export const FAVICON_SERVICE_OPTIONS: ReadonlyArray<{
  id: FaviconService;
  labelKey: string;
}> = [
  { id: 'google-v2', labelKey: 'dashboard.faviconGoogleV2' },
  { id: 'google-v1', labelKey: 'dashboard.faviconGoogleV1' },
  { id: 'yandex', labelKey: 'dashboard.faviconYandex' },
  { id: 'duckduckgo', labelKey: 'dashboard.faviconDuckDuckGo' },
  { id: 'bitwarden', labelKey: 'dashboard.faviconBitwarden' },
];

export function normalizeFaviconService(value: string | null): FaviconService {
  if (value === 'google') {
    return 'google-v2';
  }

  if (FAVICON_SERVICE_IDS.includes(value as FaviconService)) {
    return value as FaviconService;
  }

  return DEFAULT_FAVICON_SERVICE;
}

export function getFaviconServiceUrl(
  service: FaviconService,
  targetUrl: string,
  domain: string,
): string {
  switch (service) {
    case 'google-v2':
      return `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(targetUrl)}&size=32`;
    case 'google-v1':
      return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`;
    case 'yandex':
      return `https://favicon.yandex.net/favicon/${encodeURIComponent(domain)}?size=32`;
    case 'duckduckgo':
      return `https://icons.duckduckgo.com/ip3/${encodeURIComponent(domain)}.ico`;
    case 'bitwarden':
      return `https://icons.bitwarden.net/${encodeURIComponent(domain)}/icon.png`;
  }
}

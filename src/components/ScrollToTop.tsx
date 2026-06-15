import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const SCROLL_THRESHOLD = 300;

/**
 * Floating button that appears after scrolling down and smoothly returns the
 * page to the top. Mounted globally so every route gets it.
 */
const ScrollToTop = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsVisible(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={t('common.backToTop')}
      title={t('common.backToTop')}
      className={cn(
        'fixed bottom-6 right-6 z-50 flex size-11 items-center justify-center rounded-full',
        'border border-border bg-card/80 text-neutral-600 shadow-lg backdrop-blur',
        'transition-all duration-300 hover:text-primary hover:shadow-xl',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:text-neutral-300',
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-3 opacity-0',
      )}
    >
      <ArrowUp className="size-5" />
    </button>
  );
};

export default ScrollToTop;

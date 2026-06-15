import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'vela_wake_lock';

export const useWakeLock = () => {
  const sentinelRef = useRef<WakeLockSentinel | null>(null);

  // The keep-screen-on feature is disabled in mobile mode.
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches,
  );
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const isSupported =
    typeof navigator !== 'undefined' && 'wakeLock' in navigator && !isMobile;

  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return false;
    return localStorage.getItem(STORAGE_KEY) === '1';
  });

  const acquire = useCallback(async () => {
    if (!isSupported || sentinelRef.current) return;
    try {
      const sentinel = await navigator.wakeLock.request('screen');
      sentinelRef.current = sentinel;
      sentinel.addEventListener('release', () => {
        if (sentinelRef.current === sentinel) {
          sentinelRef.current = null;
        }
      });
    } catch (err) {
      console.warn('Wake lock request failed:', err);
    }
  }, [isSupported]);

  const release = useCallback(async () => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    sentinelRef.current = null;
    try {
      await sentinel.release();
    } catch {
      // The sentinel may already be released by the browser; ignore.
    }
  }, []);

  useEffect(() => {
    if (!enabled || !isSupported) {
      release();
      return;
    }

    acquire();

    // The browser auto-releases the sentinel when the tab becomes hidden.
    // Re-acquire when it returns to visible so the toggle stays effective.
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        acquire();
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled, isSupported, acquire, release]);

  useEffect(() => {
    return () => {
      release();
    };
  }, [release]);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      if (next) {
        localStorage.setItem(STORAGE_KEY, '1');
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
      return next;
    });
  }, []);

  return { enabled: enabled && isSupported, toggle, isSupported };
};

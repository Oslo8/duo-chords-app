import { useEffect, useState } from 'react';

export function useWakeLock() {
  const [isLocked, setIsLocked] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    let sentinel: WakeLockSentinel | null = null;
    const supported = 'wakeLock' in navigator;
    setIsSupported(supported);

    if (!supported) return;

    const requestLock = async () => {
      try {
        sentinel = await navigator.wakeLock.request('screen');
        setIsLocked(true);

        sentinel.addEventListener('release', () => {
          setIsLocked(false);
        });
      } catch (err) {
        console.warn('Wake Lock request failed:', err);
        setIsLocked(false);
      }
    };

    requestLock();

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && !isLocked) {
        await requestLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (sentinel) {
        sentinel.release().catch(() => {});
      }
    };
  }, []);

  return { isLocked, isSupported };
}

import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { todayKey } from '@/utils/dates';

/** Today's date key, refreshed when the app returns to the foreground (e.g. the next morning). */
export function useTodayKey() {
  const [key, setKey] = useState(todayKey);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') setKey(todayKey());
    });
    const interval = setInterval(() => setKey(todayKey()), 60_000);
    return () => {
      sub.remove();
      clearInterval(interval);
    };
  }, []);

  return key;
}

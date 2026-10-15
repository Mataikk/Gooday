import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { todayKey } from '@/utils/dates';

/** La date du jour, mise à jour quand l'app revient au premier plan (ex. le lendemain matin). */
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

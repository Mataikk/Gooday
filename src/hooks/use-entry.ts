import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useRef, useState } from 'react';

import { getEntry, saveEntry } from '@/db/entries';

export type SaveStatus = 'idle' | 'pending' | 'saved' | 'error';

const AUTOSAVE_DELAY_MS = 700;

/**
 * Loads a day's entry and autosaves every change (after a short typing
 * pause, and when the screen unmounts).
 */
export function useEntry(date: string) {
  const db = useSQLiteContext();
  const [loaded, setLoaded] = useState(false);
  const [rating, setRatingState] = useState<number | null>(null);
  const [content, setContentState] = useState('');
  const [status, setStatus] = useState<SaveStatus>('idle');

  const latest = useRef({ rating: null as number | null, content: '' });
  const dirty = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(async () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (!dirty.current) return;
    dirty.current = false;
    try {
      await saveEntry(db, date, latest.current);
      setStatus('saved');
    } catch (e) {
      console.error('Failed to save entry', e);
      dirty.current = true;
      setStatus('error');
    }
  }, [db, date]);

  // Initial load. (To switch days, remount the component with a `key`.)
  useEffect(() => {
    let cancelled = false;
    getEntry(db, date).then((entry) => {
      if (cancelled) return;
      latest.current = { rating: entry?.rating ?? null, content: entry?.content ?? '' };
      dirty.current = false;
      setRatingState(latest.current.rating);
      setContentState(latest.current.content);
      setStatus('idle');
      setLoaded(true);
    });
    return () => {
      cancelled = true;
      flush();
    };
  }, [db, date, flush]);

  const schedule = useCallback(() => {
    dirty.current = true;
    setStatus('pending');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, AUTOSAVE_DELAY_MS);
  }, [flush]);

  const setRating = useCallback(
    (value: number | null) => {
      latest.current = { ...latest.current, rating: value };
      setRatingState(value);
      schedule();
    },
    [schedule]
  );

  const setContent = useCallback(
    (value: string) => {
      latest.current = { ...latest.current, content: value };
      setContentState(value);
      schedule();
    },
    [schedule]
  );

  return { loaded, rating, content, status, setRating, setContent, flush };
}

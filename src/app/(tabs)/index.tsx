import { DayEditor } from '@/components/day-editor';
import { useTodayKey } from '@/hooks/use-today-key';

export default function TodayScreen() {
  const today = useTodayKey();
  // `key`: start with a fresh editor when the day changes.
  return <DayEditor key={today} date={today} eyebrow="Aujourd’hui" />;
}

import { DayEditor } from '@/components/day-editor';
import { useTodayKey } from '@/hooks/use-today-key';

export default function TodayScreen() {
  const today = useTodayKey();
  // `key` : on repart d'un éditeur neuf quand on change de jour.
  return <DayEditor key={today} date={today} eyebrow="Aujourd’hui" />;
}

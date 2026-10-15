/**
 * Les jours sont identifiés par une clé 'AAAA-MM-JJ' calculée dans le fuseau
 * horaire du téléphone (et non en UTC : sinon une note écrite à 1h du matin
 * à Paris tomberait sur la veille).
 */

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function isValidDateKey(key: string | undefined): key is string {
  if (!key || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return false;
  return toDateKey(fromDateKey(key)) === key;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** « Jeudi 15 octobre » (l'année n'est ajoutée que si ce n'est pas l'année en cours). */
export function formatLongDate(key: string): string {
  const date = fromDateKey(key);
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return capitalize(
    date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      ...(sameYear ? {} : { year: 'numeric' }),
    })
  );
}

/** « Octobre 2026 », pour les sections de l'historique. */
export function formatMonth(key: string): string {
  return capitalize(
    fromDateKey(key).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  );
}

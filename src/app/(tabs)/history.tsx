import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StarRating } from '@/components/star-rating';
import { ThemedText } from '@/components/themed-text';
import { Fonts, MaxContentWidth, Spacing } from '@/constants/theme';
import { listEntries, type Entry } from '@/db/entries';
import { useTheme } from '@/hooks/use-theme';
import { formatLongDate, formatMonth } from '@/utils/dates';

type Section = { title: string; data: Entry[] };

function groupByMonth(entries: Entry[]): Section[] {
  const sections: Section[] = [];
  for (const entry of entries) {
    const title = formatMonth(entry.date);
    const last = sections.at(-1);
    if (last?.title === title) last.data.push(entry);
    else sections.push({ title, data: [entry] });
  }
  return sections;
}

export default function HistoryScreen() {
  const db = useSQLiteContext();
  const theme = useTheme();
  const [entries, setEntries] = useState<Entry[] | null>(null);

  // Reload every time the tab comes into focus.
  useFocusEffect(
    useCallback(() => {
      listEntries(db).then(setEntries);
    }, [db])
  );

  const sections = useMemo(() => groupByMonth(entries ?? []), [entries]);
  const rated = (entries ?? []).filter((e) => e.rating !== null);
  const average = rated.length
    ? rated.reduce((sum, e) => sum + (e.rating ?? 0), 0) / rated.length
    : null;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.flex, { backgroundColor: theme.background }]}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.date}
        contentContainerStyle={styles.content}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText style={styles.title}>Historique</ThemedText>
            {entries && entries.length > 0 && (
              <View style={styles.stats}>
                <Stat label={entries.length > 1 ? 'jours écrits' : 'jour écrit'} value={String(entries.length)} />
                <Stat
                  label="note moyenne"
                  value={average === null ? '–' : `${average.toFixed(1).replace('.', ',')} ★`}
                />
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          entries ? (
            <View style={styles.empty}>
              <ThemedText themeColor="textSecondary" style={styles.emptyText}>
                Aucune note pour l’instant.{'\n'}Écris ta première journée dans l’onglet « Aujourd’hui ».
              </ThemedText>
            </View>
          ) : null
        }
        renderSectionHeader={({ section }) => (
          <ThemedText type="smallBold" themeColor="textSecondary" style={styles.sectionTitle}>
            {section.title.toUpperCase()}
          </ThemedText>
        )}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: '/day/[date]', params: { date: item.date } })}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement },
            ]}>
            <View style={styles.cardTop}>
              <ThemedText type="smallBold">{formatLongDate(item.date)}</ThemedText>
              <StarRating value={item.rating} size={14} />
            </View>
            {item.content.trim() !== '' && (
              <ThemedText numberOfLines={2} themeColor="textSecondary" style={styles.excerpt}>
                {item.content.trim()}
              </ThemedText>
            )}
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.stat, { backgroundColor: theme.backgroundElement }]}>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.two,
  },
  header: { gap: Spacing.three, marginBottom: Spacing.two },
  title: { fontFamily: Fonts.serif, fontSize: 34, lineHeight: 40, fontWeight: 600 },
  stats: { flexDirection: 'row', gap: Spacing.two },
  stat: { flex: 1, borderRadius: 16, padding: Spacing.three, gap: Spacing.half },
  statValue: { fontFamily: Fonts.serif, fontSize: 24, lineHeight: 30, fontWeight: 600 },
  sectionTitle: { letterSpacing: 1.2, marginTop: Spacing.three, marginBottom: Spacing.one },
  card: { borderRadius: 16, padding: Spacing.three, gap: Spacing.one },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  excerpt: { fontFamily: Fonts.serif, fontSize: 15, lineHeight: 22 },
  empty: { paddingVertical: Spacing.six },
  emptyText: { textAlign: 'center' },
});

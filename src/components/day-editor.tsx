import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StarRating, ratingLabel } from '@/components/star-rating';
import { ThemedText } from '@/components/themed-text';
import { Fonts, MaxContentWidth, Spacing } from '@/constants/theme';
import { useEntry, type SaveStatus } from '@/hooks/use-entry';
import { useTheme } from '@/hooks/use-theme';
import { formatLongDate } from '@/utils/dates';

const STATUS_TEXT: Record<SaveStatus, string> = {
  idle: '',
  pending: 'Enregistrement…',
  saved: 'Enregistré',
  error: 'Erreur d’enregistrement',
};

type Props = {
  date: string;
  /** Small label above the date (e.g. « Aujourd’hui »). */
  eyebrow?: string;
  /** Show the date as a large title at the top (not needed when a header already shows it). */
  showTitle?: boolean;
  footer?: ReactNode;
};

export function DayEditor({ date, eyebrow, showTitle = true, footer }: Props) {
  const theme = useTheme();
  const { loaded, rating, content, status, setRating, setContent } = useEntry(date);

  if (!loaded) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.textSecondary} />
      </View>
    );
  }

  return (
    <SafeAreaView
      edges={showTitle ? ['top', 'left', 'right'] : ['left', 'right']}
      style={[styles.flex, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        automaticallyAdjustKeyboardInsets
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled">
        {showTitle && (
          <View style={styles.header}>
            {eyebrow && (
              <ThemedText type="smallBold" themeColor="accent" style={styles.eyebrow}>
                {eyebrow.toUpperCase()}
              </ThemedText>
            )}
            <ThemedText style={styles.title}>{formatLongDate(date)}</ThemedText>
          </View>
        )}

        <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText type="small" themeColor="textSecondary">
            Comment s’est passée ta journée ?
          </ThemedText>
          <StarRating value={rating} onChange={setRating} />
          <ThemedText type="smallBold" themeColor={rating ? 'text' : 'textSecondary'}>
            {ratingLabel(rating)}
          </ThemedText>
        </View>

        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Raconte ta journée…"
          placeholderTextColor={theme.textSecondary}
          multiline
          scrollEnabled={false}
          textAlignVertical="top"
          style={[styles.input, { color: theme.text }]}
        />

        <View style={styles.footer}>
          <ThemedText type="small" themeColor={status === 'error' ? 'danger' : 'textSecondary'}>
            {STATUS_TEXT[status]}
          </ThemedText>
          {footer}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  header: { gap: Spacing.one },
  eyebrow: { letterSpacing: 1.2 },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: 600,
  },
  card: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.three,
    borderRadius: 20,
  },
  input: {
    minHeight: 220,
    fontFamily: Fonts.serif,
    fontSize: 18,
    lineHeight: 28,
    padding: 0,
  },
  footer: {
    alignItems: 'center',
    gap: Spacing.three,
  },
});

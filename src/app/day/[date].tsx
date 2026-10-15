import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Alert, Pressable, StyleSheet } from 'react-native';

import { DayEditor } from '@/components/day-editor';
import { ThemedText } from '@/components/themed-text';
import { deleteEntry } from '@/db/entries';
import { formatLongDate, isValidDateKey } from '@/utils/dates';

/** Read or edit a past day, opened from the history. */
export default function DayScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const db = useSQLiteContext();

  if (!isValidDateKey(date)) {
    return <ThemedText style={styles.error}>Date invalide.</ThemedText>;
  }

  const confirmDelete = () => {
    Alert.alert('Supprimer cette journée ?', 'La note et le texte seront définitivement effacés.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await deleteEntry(db, date);
          router.back();
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ title: formatLongDate(date) }} />
      <DayEditor
        date={date}
        showTitle={false}
        footer={
          <Pressable onPress={confirmDelete} hitSlop={8}>
            <ThemedText type="small" themeColor="danger">
              Supprimer cette journée
            </ThemedText>
          </Pressable>
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  error: { padding: 24 },
});

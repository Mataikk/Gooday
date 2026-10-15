import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth, useCurrentUser } from '@/auth/auth-context';
import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { Fonts, MaxContentWidth, Spacing } from '@/constants/theme';
import { listEntries } from '@/db/entries';
import { useTheme } from '@/hooks/use-theme';

export default function ProfileScreen() {
  const theme = useTheme();
  const db = useSQLiteContext();
  const user = useCurrentUser();
  const { signOut, deleteAccount } = useAuth();
  const [entryCount, setEntryCount] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      listEntries(db, user.id).then((entries) => setEntryCount(entries.length));
    }, [db, user.id])
  );

  const memberSince = new Date(user.createdAt).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  const confirmSignOut = () => {
    Alert.alert('Se déconnecter ?', 'Tu devras saisir ton mot de passe pour revenir.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Se déconnecter', onPress: signOut },
    ]);
  };

  const confirmDelete = () => {
    Alert.alert(
      'Supprimer ton compte ?',
      'Ton compte et toutes tes notes seront définitivement effacés de ce téléphone.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: deleteAccount },
      ]
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.flex, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText style={styles.title}>Profil</ThemedText>

        <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
          <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
            <ThemedText style={styles.avatarLetter}>{user.name.charAt(0).toUpperCase()}</ThemedText>
          </View>
          <ThemedText style={styles.name}>{user.name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Membre depuis {memberSince}
            {entryCount !== null &&
              ` · ${entryCount} jour${entryCount > 1 ? 's' : ''} écrit${entryCount > 1 ? 's' : ''}`}
          </ThemedText>
        </View>

        <View style={styles.actions}>
          <Button title="Se déconnecter" variant="secondary" onPress={confirmSignOut} />
          <Button title="Supprimer mon compte" variant="danger" onPress={confirmDelete} />
        </View>

        <ThemedText type="small" themeColor="textSecondary" style={styles.footnote}>
          Ton journal est stocké uniquement sur ce téléphone.
        </ThemedText>
      </ScrollView>
    </SafeAreaView>
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
    gap: Spacing.four,
  },
  title: { fontFamily: Fonts.serif, fontSize: 34, lineHeight: 40, fontWeight: 600 },
  card: { alignItems: 'center', borderRadius: 20, padding: Spacing.four, gap: Spacing.two },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  avatarLetter: { color: '#FFFFFF', fontFamily: Fonts.serif, fontSize: 32, lineHeight: 40, fontWeight: 700 },
  name: { fontFamily: Fonts.serif, fontSize: 24, lineHeight: 30, fontWeight: 600 },
  actions: { gap: Spacing.two },
  footnote: { textAlign: 'center' },
});

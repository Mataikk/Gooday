import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
// 👇 1. On importe useEffect (nécessaire pour exécuter du code au lancement de l'app)
import { useEffect } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
// 👇 2. On importe notre fichier database qu'on vient de créer
import { Database } from '@/utils/database';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // 👇 3. Ce bloc "useEffect" s'exécute une seule fois, juste après que l'app s'affiche
  useEffect(() => {
    try {
      // On demande à créer la table "logs" si elle n'existe pas
      Database.init();
      console.log('✅ Base de données initialisée avec succès');
    } catch (e) {
      console.error('❌ Erreur lors de l\'initialisation de la DB:', e);
    }
  }, []); // Le tableau vide [] signifie : "Ne le fais qu'au tout premier chargement"

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { useTheme } from '@/hooks/use-theme';

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <NativeTabs tintColor={theme.accent} labelStyle={{ selected: { color: theme.accent } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Aujourd’hui</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'square.and.pencil', selected: 'square.and.pencil' }} md="edit_note" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="history">
        <NativeTabs.Trigger.Label>Historique</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'book', selected: 'book.fill' }} md="menu_book" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

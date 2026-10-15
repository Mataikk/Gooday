import * as Haptics from 'expo-haptics';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const LABELS = ['Très mauvaise', 'Mauvaise', 'Moyenne', 'Bonne', 'Excellente'];

export function ratingLabel(rating: number | null): string {
  return rating ? LABELS[rating - 1] : 'Pas encore notée';
}

type Props = {
  value: number | null;
  /** When omitted, the rating is read-only. */
  onChange?: (value: number | null) => void;
  size?: number;
};

export function StarRating({ value, onChange, size = 40 }: Props) {
  const theme = useTheme();

  return (
    <View
      style={[styles.row, { gap: size / 5 }]}
      accessibilityRole={onChange ? 'adjustable' : 'text'}
      accessibilityLabel={`Note : ${value ?? 0} sur 5`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = value !== null && star <= value;
        const icon = (
          <SymbolView
            name={{ ios: filled ? 'star.fill' : 'star', android: 'star', web: 'star' }}
            size={size}
            tintColor={filled ? theme.accent : theme.starEmpty}
          />
        );
        if (!onChange) return <View key={star}>{icon}</View>;
        return (
          <Pressable
            key={star}
            hitSlop={size / 8}
            accessibilityLabel={`${star} étoile${star > 1 ? 's' : ''}`}
            onPress={() => {
              Haptics.selectionAsync();
              // Tapping the selected star again clears the rating.
              onChange(value === star ? null : star);
            }}
            style={({ pressed }) => pressed && styles.pressed}>
            {icon}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.one,
  },
  pressed: {
    opacity: 0.6,
    transform: [{ scale: 0.92 }],
  },
});

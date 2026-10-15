/**
 * Couleurs et espacements de Gooday, en mode clair et sombre.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#2B2622',
    background: '#FBF8F3',
    backgroundElement: '#F1ECE4',
    backgroundSelected: '#E6DFD4',
    textSecondary: '#7A7067',
    border: '#E2DACF',
    accent: '#E8A33D',
    starEmpty: '#D6CCBF',
    danger: '#C2410C',
  },
  dark: {
    text: '#F4EFE8',
    background: '#171412',
    backgroundElement: '#24201C',
    backgroundSelected: '#312B26',
    textSecondary: '#A89E94',
    border: '#3A332D',
    accent: '#F2B451',
    starEmpty: '#4A423B',
    danger: '#F97316',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const MaxContentWidth = 640;

/** Compatibility bridge for the remaining Expo starter primitives. */

import '@/global.css';

import { Platform } from 'react-native';
import {
  Colors as RabAIColors,
  PageWidths,
  Spacing as RabAISpacing,
} from '@/theme';

export const Colors = {
  light: {
    text: RabAIColors.textPrimary,
    background: RabAIColors.canvas,
    backgroundElement: RabAIColors.surface,
    backgroundSelected: RabAIColors.goldMuted,
    textSecondary: RabAIColors.textSecondary,
  },
  dark: {
    text: RabAIColors.textOnDark,
    background: RabAIColors.shellBackground,
    backgroundElement: RabAIColors.shellSurface,
    backgroundSelected: RabAIColors.shellElevated,
    textSecondary: RabAIColors.textOnInverseSecondary,
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
  half: RabAISpacing.micro,
  one: RabAISpacing.compact,
  two: RabAISpacing.control,
  three: RabAISpacing.component,
  four: RabAISpacing.section,
  five: RabAISpacing.page,
  six: RabAISpacing.display,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = PageWidths.form;

import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Colors as AppColors, Typography } from '@/theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    fontSize: Typography.caption,
    lineHeight: Typography.lineHeight.compact,
    fontWeight: Typography.fontWeight.medium,
  },
  smallBold: {
    fontSize: Typography.caption,
    lineHeight: Typography.lineHeight.compact,
    fontWeight: Typography.fontWeight.bold,
  },
  default: {
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.default,
    fontWeight: Typography.fontWeight.medium,
  },
  title: {
    fontSize: Typography.display,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: Typography.lineHeight.display,
  },
  subtitle: {
    fontSize: Typography.title,
    lineHeight: Typography.lineHeight.subtitleLarge,
    fontWeight: Typography.fontWeight.semibold,
  },
  link: {
    lineHeight: Typography.lineHeight.link,
    fontSize: Typography.caption,
  },
  linkPrimary: {
    lineHeight: Typography.lineHeight.link,
    fontSize: Typography.caption,
    color: AppColors.link,
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: Typography.fontWeight.bold }) ?? Typography.fontWeight.medium,
    fontSize: Typography.small,
  },
});

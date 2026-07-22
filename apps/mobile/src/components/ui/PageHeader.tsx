import { type ReactNode } from "react";
import {
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Breakpoints, Colors, Spacing, Typography } from "@/theme";
import { RabAIButton } from "./Button";

export type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  breadcrumbs?: ReactNode;
  actions?: ReactNode;
  leading?: ReactNode;
  backLabel?: string;
  onBack?: () => void;
  align?: "start" | "center";
  style?: StyleProp<ViewStyle>;
  titleSize?: "default" | "hero";
};

export default function PageHeader({
  actions,
  align = "start",
  backLabel = "Înapoi",
  breadcrumbs,
  description,
  eyebrow,
  leading,
  onBack,
  style,
  title,
  titleSize = "default",
}: PageHeaderProps) {
  const { width } = useWindowDimensions();
  const compact = width < Breakpoints.mobile;
  const centered = align === "center";

  return (
    <View
      style={[
        styles.container,
        compact && styles.containerCompact,
        centered && styles.centered,
        style,
      ]}
    >
      {breadcrumbs ? <View style={styles.breadcrumbs}>{breadcrumbs}</View> : null}
      {onBack ? (
        <RabAIButton
          onPress={onBack}
          size="sm"
          style={styles.backButton}
          title={backLabel}
          variant="ghost"
        />
      ) : null}
      <View
        style={[
          styles.mainRow,
          compact && styles.mainRowCompact,
          centered && styles.mainRowCentered,
        ]}
      >
        {leading ? <View style={styles.leading}>{leading}</View> : null}
        <View style={[styles.copy, centered && styles.copyCentered]}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text
            accessibilityRole="header"
            style={[
              styles.title,
              titleSize === "hero" && styles.heroTitle,
              compact && styles.titleCompact,
              centered && styles.centeredText,
            ]}
          >
            {title}
          </Text>
          {description ? (
            <Text
              style={[styles.description, centered && styles.centeredText]}
            >
              {description}
            </Text>
          ) : null}
        </View>
        {actions ? (
          <View
            style={[
              styles.actions,
              compact && styles.actionsCompact,
              centered && styles.actionsCentered,
            ]}
          >
            {actions}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "stretch",
    marginBottom: Spacing.section,
    minWidth: 0,
  },
  containerCompact: {
    marginBottom: Spacing.component,
  },
  centered: {
    alignItems: "center",
  },
  breadcrumbs: {
    marginBottom: Spacing.control,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: Spacing.control,
  },
  mainRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: Spacing.component,
    justifyContent: "space-between",
    minWidth: 0,
  },
  mainRowCompact: {
    flexDirection: "column",
  },
  mainRowCentered: {
    alignItems: "center",
    justifyContent: "center",
  },
  leading: {
    flexShrink: 0,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  copyCentered: {
    alignItems: "center",
    maxWidth: 840,
  },
  eyebrow: {
    color: Colors.goldPressed,
    fontSize: Typography.caption,
    fontWeight: Typography.fontWeight.semibold,
    letterSpacing: Typography.letterSpacing.eyebrow,
    marginBottom: Spacing.control,
    textTransform: "uppercase",
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.pageTitle,
    fontWeight: Typography.fontWeight.semibold,
    letterSpacing: Typography.letterSpacing.tight,
    lineHeight: Typography.lineHeight.pageTitle,
  },
  heroTitle: {
    fontSize: Typography.pageTitle,
    lineHeight: Typography.lineHeight.display,
  },
  titleCompact: {
    fontSize: Typography.sectionHeading,
    lineHeight: Typography.lineHeight.heading,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.body,
    marginTop: Spacing.control,
    maxWidth: 760,
  },
  centeredText: {
    textAlign: "center",
  },
  actions: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 0,
    flexWrap: "wrap",
    gap: Spacing.control,
  },
  actionsCompact: {
    alignSelf: "stretch",
    width: "100%",
  },
  actionsCentered: {
    justifyContent: "center",
  },
});

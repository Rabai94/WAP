import { type ReactNode } from "react";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { RabAIBadge } from "./Badge";
import { RabAIButton } from "./Button";

export type FilterBarProps = {
  children?: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
  activeFilterCount?: number;
  activeFilterLabel?: string;
  onOpenFilters?: () => void;
  openFiltersLabel?: string;
  onClearFilters?: () => void;
  clearFiltersLabel?: string;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function FilterBar({
  actions,
  activeFilterCount = 0,
  activeFilterLabel,
  children,
  clearFiltersLabel = "Resetează",
  compact = false,
  description,
  onClearFilters,
  onOpenFilters,
  openFiltersLabel = "Filtre",
  style,
  title,
}: FilterBarProps) {
  const hasHeader = Boolean(
    title || description || activeFilterCount > 0 || onOpenFilters || onClearFilters || actions
  );

  return (
    <View
      accessibilityLabel={title ?? openFiltersLabel}
      style={[styles.container, compact && styles.compact, style]}
    >
      {hasHeader ? (
        <View style={styles.header}>
          <View style={styles.copy}>
            <View style={styles.titleRow}>
              {title ? <Text style={styles.title}>{title}</Text> : null}
              {activeFilterCount > 0 ? (
                <RabAIBadge
                  label={
                    activeFilterLabel ??
                    `${activeFilterCount} ${activeFilterCount === 1 ? "filtru activ" : "filtre active"}`
                  }
                  tone="primary"
                />
              ) : null}
            </View>
            {description ? <Text style={styles.description}>{description}</Text> : null}
          </View>
          <View style={styles.headerActions}>
            {onClearFilters && activeFilterCount > 0 ? (
              <RabAIButton
                onPress={onClearFilters}
                size="sm"
                title={clearFiltersLabel}
                variant="ghost"
              />
            ) : null}
            {onOpenFilters ? (
              <RabAIButton
                onPress={onOpenFilters}
                size="sm"
                title={openFiltersLabel}
                variant="secondary"
              />
            ) : null}
            {actions}
          </View>
        </View>
      ) : null}
      {children ? <View style={styles.filters}>{children}</View> : null}
    </View>
  );
}

export { FilterBar };

const styles = StyleSheet.create({
  container: {
    alignSelf: "stretch",
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.border,
    borderRadius: Radius.panel,
    borderWidth: 1,
    gap: Spacing.inline,
    minWidth: 0,
    padding: Spacing.component,
  },
  compact: {
    borderLeftWidth: 0,
    borderRadius: 0,
    borderRightWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: Spacing.inline,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.inline,
    justifyContent: "space-between",
    minWidth: 0,
  },
  copy: {
    flex: 1,
    minWidth: 220,
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.control,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.sectionHeading,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: Typography.lineHeight.heading,
  },
  description: {
    color: Colors.textMuted,
    fontSize: Typography.supporting,
    lineHeight: Typography.lineHeight.supporting,
    marginTop: Spacing.compact,
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 0,
    flexWrap: "wrap",
    gap: Spacing.control,
    justifyContent: "flex-end",
  },
  filters: {
    alignItems: "flex-end",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.inline,
    minWidth: 0,
  },
});

import { type ReactNode } from "react";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Colors, Spacing, Typography } from "@/theme";

export type DefinitionListItem = {
  label: string;
  value: ReactNode;
  accessibilityLabel?: string;
};

export type DefinitionListProps = {
  items: readonly DefinitionListItem[];
  columns?: 1 | 2 | 3;
  dividers?: boolean;
  emptyValue?: string;
  style?: StyleProp<ViewStyle>;
  itemStyle?: StyleProp<ViewStyle>;
  testID?: string;
};

export default function DefinitionList({
  columns = 1,
  dividers = true,
  emptyValue = "—",
  itemStyle,
  items,
  style,
  testID,
}: DefinitionListProps) {
  return (
    <View
      accessibilityRole="summary"
      style={[styles.list, columns > 1 && styles.grid, style]}
      testID={testID}
    >
      {items.map((item, index) => (
        <View
          accessibilityLabel={item.accessibilityLabel}
          key={`${item.label}-${index}`}
          style={[
            styles.item,
            columns === 2 && styles.half,
            columns === 3 && styles.third,
            dividers && styles.divided,
            itemStyle,
          ]}
        >
          <Text style={styles.label}>{item.label}</Text>
          {typeof item.value === "string" || typeof item.value === "number" ? (
            <Text selectable style={styles.value}>
              {String(item.value).trim() || emptyValue}
            </Text>
          ) : item.value ? (
            <View style={styles.valueNode}>{item.value}</View>
          ) : (
            <Text style={styles.value}>{emptyValue}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

export { DefinitionList };

const styles = StyleSheet.create({
  list: {
    alignSelf: "stretch",
    minWidth: 0,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.inline,
  },
  item: {
    alignItems: "flex-start",
    gap: Spacing.compact,
    minWidth: 0,
    paddingVertical: Spacing.inline,
  },
  half: {
    flexBasis: 280,
    flexGrow: 1,
  },
  third: {
    flexBasis: 220,
    flexGrow: 1,
  },
  divided: {
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
  },
  label: {
    color: Colors.textMuted,
    fontSize: Typography.caption,
    fontWeight: Typography.fontWeight.semibold,
    letterSpacing: Typography.letterSpacing.label,
    lineHeight: Typography.lineHeight.compact,
    textTransform: "uppercase",
  },
  value: {
    color: Colors.textPrimary,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.body,
  },
  valueNode: {
    alignSelf: "stretch",
    minWidth: 0,
  },
});

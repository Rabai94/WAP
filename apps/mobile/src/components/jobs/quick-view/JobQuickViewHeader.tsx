import AppIcon from "@/components/navigation/AppIcon";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ViewStyle,
} from "react-native";
import { getInitials } from "./CompanyPublicSummary";

type HeaderMetaItem = {
  label: string;
  value: string;
};

type JobQuickViewHeaderProps = {
  companyCoverUrl?: string | null;
  companyLogoUrl?: string | null;
  companyName: string;
  metaItems: HeaderMetaItem[];
  onClose: () => void;
  title: string;
  verified: boolean;
};

const pointerWebStyle =
  Platform.OS === "web"
    ? ({ cursor: "pointer" } as unknown as ViewStyle)
    : null;

export default function JobQuickViewHeader({
  companyCoverUrl,
  companyLogoUrl,
  companyName,
  metaItems,
  onClose,
  title,
  verified,
}: JobQuickViewHeaderProps) {
  const { width } = useWindowDimensions();
  const isPhone = width < 640;
  const isTablet = width >= 640 && width < 1120;
  const coverHeight = isPhone ? 112 : isTablet ? 148 : 184;
  const logoSize = isPhone ? 48 : 64;
  const [failedCoverUrl, setFailedCoverUrl] = useState<string | null>(null);
  const [failedLogoUrl, setFailedLogoUrl] = useState<string | null>(null);
  const resolvedCoverUrl = companyCoverUrl?.trim() || null;
  const resolvedLogoUrl = companyLogoUrl?.trim() || null;

  return (
    <View style={styles.header}>
      <View style={[styles.cover, { height: coverHeight }]}>
        {resolvedCoverUrl && failedCoverUrl !== resolvedCoverUrl ? (
          <Image
            accessibilityIgnoresInvertColors
            onError={() => setFailedCoverUrl(resolvedCoverUrl)}
            resizeMode="cover"
            source={{ uri: resolvedCoverUrl }}
            style={styles.coverImage}
          />
        ) : null}
        <View pointerEvents="none" style={styles.coverOverlay} />
        <View pointerEvents="none" style={styles.neutralAccent} />

        <Pressable
          accessibilityLabel="Închide"
          accessibilityRole="button"
          onPress={onClose}
          style={({ hovered, pressed }) => [
            styles.closeButton,
            pointerWebStyle,
            hovered && styles.closeButtonHover,
            pressed && styles.closeButtonPressed,
          ]}
          testID="job-quick-view-close"
        >
          <AppIcon color={Colors.white} name="close" size={20} />
        </Pressable>

        <View
          style={[
            styles.coverCopy,
            { paddingLeft: logoSize + (isPhone ? 28 : 40) },
          ]}
        >
          <Text
            numberOfLines={2}
            style={[styles.title, isPhone && styles.titlePhone]}
          >
            {title}
          </Text>
          <View style={styles.companyLine}>
            <Text numberOfLines={1} style={styles.companyName}>
              {companyName}
            </Text>
            {verified ? (
              <View
                accessibilityLabel="Companie verificată"
                accessible
                style={styles.verifiedBadge}
              >
                <Text style={styles.verifiedMark}>✓</Text>
                {!isPhone ? (
                  <Text style={styles.verifiedText}>Companie verificată</Text>
                ) : null}
              </View>
            ) : null}
          </View>
        </View>

        <View
          style={[
            styles.logo,
            {
              borderRadius: isPhone ? Radius.lg : Radius.card,
              height: logoSize,
              width: logoSize,
            },
          ]}
        >
          {resolvedLogoUrl && failedLogoUrl !== resolvedLogoUrl ? (
            <Image
              accessibilityIgnoresInvertColors
              onError={() => setFailedLogoUrl(resolvedLogoUrl)}
              resizeMode="cover"
              source={{ uri: resolvedLogoUrl }}
              style={styles.logoImage}
            />
          ) : (
            <Text style={[styles.logoText, isPhone && styles.logoTextPhone]}>
              {getInitials(companyName)}
            </Text>
          )}
        </View>
      </View>

      {metaItems.length > 0 ? (
        <View style={[styles.metaRow, isPhone && styles.metaRowPhone]}>
          {metaItems.map((item) => (
            <View key={item.label} style={styles.metaItem}>
              <Text style={styles.metaLabel}>{item.label}</Text>
              <Text numberOfLines={1} style={styles.metaValue}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.surface,
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
  },
  cover: {
    backgroundColor: "#17213F",
    overflow: "visible",
    position: "relative",
  },
  coverImage: {
    ...StyleSheet.absoluteFill,
  },
  coverOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(6, 14, 34, 0.68)",
  },
  neutralAccent: {
    backgroundColor: "rgba(91, 119, 184, 0.16)",
    borderRadius: Radius.round,
    height: 180,
    position: "absolute",
    right: -44,
    top: -76,
    transform: [{ rotate: "14deg" }],
    width: 260,
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: "rgba(4, 10, 25, 0.62)",
    borderColor: "rgba(255, 255, 255, 0.32)",
    borderRadius: Radius.round,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    position: "absolute",
    right: Spacing.three,
    top: Spacing.three,
    width: 44,
    zIndex: 2,
  },
  closeButtonHover: {
    backgroundColor: "rgba(4, 10, 25, 0.82)",
  },
  closeButtonPressed: {
    opacity: 0.82,
  },
  coverCopy: {
    bottom: Spacing.three,
    gap: Spacing.sm,
    paddingRight: 72,
    position: "absolute",
    right: 0,
    left: 0,
    zIndex: 1,
  },
  title: {
    color: Colors.white,
    fontSize: Typography.headline,
    fontWeight: Typography.fontWeight.black,
    lineHeight: 34,
    textShadowColor: "rgba(0, 0, 0, 0.38)",
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 4,
  },
  titlePhone: {
    fontSize: Typography.h4,
    lineHeight: 24,
  },
  companyLine: {
    alignItems: "center",
    flexDirection: "row",
    gap: Spacing.md,
    minWidth: 0,
  },
  companyName: {
    color: "rgba(255, 255, 255, 0.92)",
    flexShrink: 1,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
  },
  verifiedBadge: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderRadius: Radius.round,
    flexDirection: "row",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  verifiedMark: {
    color: Colors.success,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.extraBold,
  },
  verifiedText: {
    color: "#116149",
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
  },
  logo: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderColor: Colors.white,
    borderWidth: 3,
    bottom: -24,
    justifyContent: "center",
    left: Spacing.screen,
    overflow: "hidden",
    position: "absolute",
    shadowColor: "#06102B",
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    zIndex: 2,
  },
  logoImage: {
    height: "100%",
    width: "100%",
  },
  logoText: {
    color: Colors.brandDeep,
    fontSize: Typography.total,
    fontWeight: Typography.fontWeight.black,
  },
  logoTextPhone: {
    fontSize: Typography.bodySmall,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    paddingBottom: Spacing.three,
    paddingHorizontal: Spacing.screen,
    paddingTop: 36,
  },
  metaRowPhone: {
    paddingHorizontal: Spacing.three,
    paddingTop: 32,
  },
  metaItem: {
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.borderMuted,
    borderRadius: Radius.round,
    borderWidth: 1,
    flexDirection: "row",
    gap: Spacing.xs,
    maxWidth: "100%",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  metaLabel: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
  },
  metaValue: {
    color: Colors.textBody,
    flexShrink: 1,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.extraBold,
  },
});

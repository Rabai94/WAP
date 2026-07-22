import AppIcon from "@/components/navigation/AppIcon";
import {
  Colors,
  ControlHeight,
  InteractionStyles,
  Radius,
  Shadows,
  Spacing,
  TextShadows,
  Typography,
} from "@/theme";
import { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
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
  const [closeFocused, setCloseFocused] = useState(false);
  const [closeHovered, setCloseHovered] = useState(false);
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
        <View style={[styles.coverOverlay, styles.nonInteractive]} />
        <View style={[styles.neutralAccent, styles.nonInteractive]} />

        <Pressable
          accessibilityLabel="Închide"
          accessibilityRole="button"
          onBlur={() => setCloseFocused(false)}
          onFocus={() => setCloseFocused(true)}
          onHoverIn={() => setCloseHovered(true)}
          onHoverOut={() => setCloseHovered(false)}
          onPress={onClose}
          style={({ pressed }) => [
            styles.closeButton,
            InteractionStyles.pointer,
            closeHovered && styles.closeButtonHover,
            pressed && styles.closeButtonPressed,
            closeFocused && InteractionStyles.focusRing,
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
    backgroundColor: Colors.textPrimary,
    overflow: "visible",
    position: "relative",
  },
  coverImage: {
    ...StyleSheet.absoluteFill,
  },
  coverOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.overlay,
  },
  neutralAccent: {
    backgroundColor: Colors.primarySoft,
    borderRadius: Radius.round,
    height: 180,
    position: "absolute",
    right: -44,
    top: -76,
    transform: [{ rotate: "14deg" }],
    width: 260,
    opacity: 0.16,
  },
  nonInteractive: {
    pointerEvents: "none",
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: Colors.overlay,
    borderColor: Colors.borderStrong,
    borderRadius: Radius.round,
    borderWidth: 1,
    height: ControlHeight.minimumTouch,
    justifyContent: "center",
    position: "absolute",
    right: Spacing.three,
    top: Spacing.three,
    width: ControlHeight.minimumTouch,
    zIndex: 2,
  },
  closeButtonHover: {
    backgroundColor: Colors.textPrimary,
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
    ...TextShadows.onImage,
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
    color: Colors.textOnDark,
    flexShrink: 1,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
  },
  verifiedBadge: {
    alignItems: "center",
    backgroundColor: Colors.surface,
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
    color: Colors.success,
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
    zIndex: 2,
    ...Shadows.elevated,
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

import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import { Image } from "expo-image";
import { useState } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import OrganizationAvatar from "./OrganizationAvatar";

type OrganizationHeroProps = {
  city?: string | null;
  coverUrl?: string | null;
  industry?: string | null;
  logoUrl?: string | null;
  name: string;
  verificationStatus: string;
  verifiedLabel?: string;
  website?: string | null;
};

export default function OrganizationHero({
  city,
  coverUrl,
  industry,
  logoUrl,
  name,
  verificationStatus,
  verifiedLabel = "Verified",
  website,
}: OrganizationHeroProps) {
  const { width } = useWindowDimensions();
  const isPhone = width < 640;
  const isTablet = width >= 640 && width < 1120;
  const coverHeight = isPhone ? 112 : isTablet ? 148 : 184;
  const avatarSize = isPhone ? 56 : 76;
  const [failedCoverUrl, setFailedCoverUrl] = useState<string | null>(null);
  const resolvedCoverUrl = coverUrl?.trim() || null;
  const visibleCoverUrl =
    resolvedCoverUrl && failedCoverUrl !== resolvedCoverUrl
      ? resolvedCoverUrl
      : null;
  const metaItems = [
    industry?.trim() || null,
    city?.trim() || null,
    formatWebsite(website),
  ].filter((item): item is string => Boolean(item));

  return (
    <View style={styles.hero}>
      <View style={[styles.cover, { height: coverHeight }]}>
        {visibleCoverUrl ? (
          <Image
            accessible={false}
            alt=""
            contentFit="cover"
            onError={() => setFailedCoverUrl(visibleCoverUrl)}
            source={{ uri: visibleCoverUrl }}
            style={styles.coverImage}
            transition={160}
          />
        ) : null}
        <View pointerEvents="none" style={styles.coverOverlay} />
        <View pointerEvents="none" style={styles.accentLarge} />
        <View pointerEvents="none" style={styles.accentSmall} />

        {verificationStatus === "verified" ? (
          <View
            accessibilityLabel={verifiedLabel}
            accessible
            style={styles.verifiedBadge}
          >
            <Text style={styles.verifiedMark}>✓</Text>
            <Text style={styles.verifiedText}>{verifiedLabel}</Text>
          </View>
        ) : null}
      </View>

      <View
        style={[
          styles.avatarPosition,
          {
            left: isPhone ? Spacing.three : Spacing.screen,
            top: coverHeight - Math.round(avatarSize * 0.5),
          },
        ]}
      >
        <OrganizationAvatar
          decorative
          logoUrl={logoUrl}
          name={name}
          size={avatarSize}
          style={styles.avatarShadow}
        />
      </View>

      <View
        style={[
          styles.identity,
          {
            paddingHorizontal: isPhone ? Spacing.three : Spacing.screen,
            paddingTop: Math.round(avatarSize * 0.5) + Spacing.three,
          },
        ]}
      >
        <Text
          accessibilityRole="header"
          selectable
          style={[styles.name, isPhone && styles.namePhone]}
        >
          {name}
        </Text>
        {metaItems.length > 0 ? (
          <View style={styles.metaRow}>
            {metaItems.map((item) => (
              <View key={item} style={styles.metaPill}>
                <Text numberOfLines={1} style={styles.metaText}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

function formatWebsite(value?: string | null) {
  if (!value?.trim()) {
    return null;
  }

  try {
    return new URL(value.trim()).hostname.replace(/^www\./i, "");
  } catch {
    return null;
  }
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
    ...Shadows.card,
  },
  cover: {
    backgroundColor: "#17213F",
    overflow: "hidden",
    position: "relative",
  },
  coverImage: {
    ...StyleSheet.absoluteFill,
  },
  coverOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(7, 16, 39, 0.52)",
  },
  accentLarge: {
    backgroundColor: "rgba(92, 124, 196, 0.20)",
    borderRadius: Radius.round,
    height: 220,
    position: "absolute",
    right: -48,
    top: -98,
    transform: [{ rotate: "14deg" }],
    width: 320,
  },
  accentSmall: {
    backgroundColor: "rgba(110, 29, 255, 0.14)",
    borderRadius: Radius.round,
    bottom: -44,
    height: 112,
    left: "28%",
    position: "absolute",
    width: 190,
  },
  verifiedBadge: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderColor: "rgba(255, 255, 255, 0.76)",
    borderRadius: Radius.round,
    borderWidth: 1,
    flexDirection: "row",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    position: "absolute",
    right: Spacing.three,
    top: Spacing.three,
  },
  verifiedMark: {
    color: "#056B4B",
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.black,
  },
  verifiedText: {
    color: "#056B4B",
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.extraBold,
  },
  avatarPosition: {
    position: "absolute",
    zIndex: 2,
  },
  avatarShadow: {
    shadowColor: "#06102B",
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  identity: {
    paddingBottom: Spacing.screen,
  },
  name: {
    color: Colors.text,
    fontSize: Typography.headline,
    fontWeight: Typography.fontWeight.black,
    lineHeight: 36,
  },
  namePhone: {
    fontSize: Typography.h4,
    lineHeight: 27,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  metaPill: {
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.borderMuted,
    borderRadius: Radius.round,
    borderWidth: 1,
    maxWidth: "100%",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  metaText: {
    color: Colors.textBody,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
  },
});

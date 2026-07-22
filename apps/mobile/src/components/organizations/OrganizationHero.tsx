import { IdentityHeader, RabAIBadge } from "@/components/ui";
import { Breakpoints, Colors, Radius, Spacing, Typography } from "@/theme";
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
  const compact = width < Breakpoints.mobile;
  const coverHeight = compact ? 88 : 120;
  const avatarSize = compact ? 56 : 72;
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
          />
        ) : null}
      </View>

      <IdentityHeader
        avatar={
          <OrganizationAvatar
            decorative
            logoUrl={logoUrl}
            name={name}
            size={avatarSize}
          />
        }
        badges={
          verificationStatus === "verified" ? (
            <RabAIBadge label={verifiedLabel} tone="success" />
          ) : undefined
        }
        meta={
          metaItems.length > 0 ? (
            <Text style={styles.metaText}>{metaItems.join(" / ")}</Text>
          ) : undefined
        }
        style={styles.identity}
        title={name}
      />
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
    alignSelf: "stretch",
    gap: Spacing.component,
    minWidth: 0,
  },
  cover: {
    backgroundColor: Colors.shellSurface,
    borderRadius: Radius.panel,
    overflow: "hidden",
  },
  coverImage: {
    ...StyleSheet.absoluteFill,
  },
  identity: {
    paddingHorizontal: Spacing.control,
  },
  metaText: {
    color: Colors.textSecondary,
    fontSize: Typography.supporting,
    lineHeight: Typography.lineHeight.supporting,
  },
});

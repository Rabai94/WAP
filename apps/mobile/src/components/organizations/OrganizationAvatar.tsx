import { Colors, Radius, Typography } from "@/theme";
import { Image } from "expo-image";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { getOrganizationInitials } from "./organizationProfile";

type OrganizationAvatarProps = {
  accessibilityLabel?: string;
  decorative?: boolean;
  logoUrl?: string | null;
  name: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export default function OrganizationAvatar({
  accessibilityLabel,
  decorative = true,
  logoUrl,
  name,
  size = 64,
  style,
}: OrganizationAvatarProps) {
  const [failedLogoUrl, setFailedLogoUrl] = useState<string | null>(null);
  const resolvedLogoUrl = logoUrl?.trim() || null;
  const visibleLogoUrl =
    resolvedLogoUrl && failedLogoUrl !== resolvedLogoUrl
      ? resolvedLogoUrl
      : null;

  return (
    <View
      accessibilityLabel={decorative ? undefined : accessibilityLabel ?? name}
      accessibilityElementsHidden={decorative}
      accessible={!decorative}
      importantForAccessibility={
        decorative ? "no-hide-descendants" : "auto"
      }
      style={[
        styles.avatar,
        {
          borderRadius: size <= 52 ? Radius.control : Radius.panel,
          height: size,
          width: size,
        },
        style,
      ]}
    >
      {visibleLogoUrl ? (
        <Image
          accessibilityLabel={undefined}
          accessible={false}
          alt=""
          contentFit="contain"
          onError={() => setFailedLogoUrl(visibleLogoUrl)}
          source={{ uri: visibleLogoUrl }}
          style={styles.image}
          transition={120}
        />
      ) : (
        <Text
          maxFontSizeMultiplier={1.4}
          style={[
            styles.initials,
            { fontSize: Math.max(Typography.caption, Math.round(size * 0.3)) },
          ]}
        >
          {getOrganizationInitials(name)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    backgroundColor: Colors.goldMuted,
    borderColor: Colors.surfaceElevated,
    borderWidth: 2,
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    height: "100%",
    width: "100%",
  },
  initials: {
    color: Colors.goldPressed,
    fontWeight: Typography.fontWeight.semibold,
    letterSpacing: Typography.letterSpacing.normal,
  },
});

import {
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { ImageSourcePropType } from "react-native";
import type { NationalIdentity } from "@/domain/nationality/nationalities";

const insigniaAssets: Partial<Record<string, ImageSourcePropType>> = {
  DE: require("../assets/insignias/de.png"),
  EN: require("../assets/insignias/en.png"),
  RO: require("../assets/insignias/ro.png"),
};

type NationalInsigniaBadgeProps = {
  identity: NationalIdentity;
  size?: "sm" | "md" | "lg";
  showCode?: boolean;
  showDialCode?: boolean;
  showName?: boolean;
  withChevron?: boolean;
};

export default function NationalInsigniaBadge({
  identity,
  size = "md",
  showCode = true,
  showDialCode = false,
  showName = false,
  withChevron = false,
}: NationalInsigniaBadgeProps) {
  const asset = getInsigniaAsset(identity.code);
  const shouldShowExternalCode = showCode && Boolean(asset);

  return (
    <View style={[styles.container, containerSizeStyles[size]]}>
      {asset ? (
        <Image
          accessibilityLabel={`${identity.name} insignia`}
          resizeMode="contain"
          source={asset}
          style={[styles.insigniaImage, imageSizeStyles[size]]}
        />
      ) : (
        <View style={[styles.placeholderShield, placeholderSizeStyles[size]]}>
          <Text style={[styles.placeholderCode, placeholderTextSizes[size]]}>
            {identity.code}
          </Text>
        </View>
      )}

      {shouldShowExternalCode ? (
        <Text style={[styles.code, textSizeStyles[size]]}>{identity.code}</Text>
      ) : null}
      {showName ? (
        <Text style={[styles.name, textSizeStyles[size]]}>{identity.name}</Text>
      ) : null}
      {showDialCode && identity.dialCode ? (
        <Text style={[styles.dialCode, textSizeStyles[size]]}>
          {identity.dialCode}
        </Text>
      ) : null}
      {withChevron ? (
        <Text style={[styles.chevron, textSizeStyles[size]]}>▼</Text>
      ) : null}
    </View>
  );
}

function getInsigniaAsset(code: string) {
  return insigniaAssets[code.trim().toUpperCase()];
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderColor: "#D9D2EA",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    shadowColor: "#172033",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  containerSm: {
    gap: 7,
    minHeight: 40,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  containerMd: {
    gap: 9,
    minHeight: 50,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  containerLg: {
    gap: 11,
    minHeight: 66,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  insigniaImage: {
    borderRadius: 8,
  },
  imageSm: {
    height: 30,
    width: 28,
  },
  imageMd: {
    height: 40,
    width: 36,
  },
  imageLg: {
    height: 56,
    width: 50,
  },
  placeholderShield: {
    alignItems: "center",
    backgroundColor: "#F8F5FF",
    borderColor: "#C8B06A",
    borderWidth: 1,
    justifyContent: "center",
    shadowColor: "#172033",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  placeholderSm: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    height: 30,
    width: 28,
  },
  placeholderMd: {
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: 40,
    width: 36,
  },
  placeholderLg: {
    borderBottomLeftRadius: 19,
    borderBottomRightRadius: 19,
    borderTopLeftRadius: 21,
    borderTopRightRadius: 21,
    height: 56,
    width: 50,
  },
  placeholderCode: {
    color: "#4C1D95",
    fontWeight: "900",
    letterSpacing: 0,
  },
  placeholderTextSm: {
    fontSize: 11,
  },
  placeholderTextMd: {
    fontSize: 13,
  },
  placeholderTextLg: {
    fontSize: 16,
  },
  code: {
    color: "#111827",
    fontWeight: "900",
    letterSpacing: 0,
  },
  name: {
    color: "#374151",
    fontWeight: "700",
    letterSpacing: 0,
  },
  dialCode: {
    color: "#5B21B6",
    fontWeight: "900",
    letterSpacing: 0,
  },
  chevron: {
    color: "#6B7280",
    fontWeight: "900",
    letterSpacing: 0,
  },
  textSm: {
    fontSize: 13,
  },
  textMd: {
    fontSize: 15,
  },
  textLg: {
    fontSize: 18,
  },
});

const containerSizeStyles = {
  sm: styles.containerSm,
  md: styles.containerMd,
  lg: styles.containerLg,
};

const imageSizeStyles = {
  sm: styles.imageSm,
  md: styles.imageMd,
  lg: styles.imageLg,
};

const placeholderSizeStyles = {
  sm: styles.placeholderSm,
  md: styles.placeholderMd,
  lg: styles.placeholderLg,
};

const placeholderTextSizes = {
  sm: styles.placeholderTextSm,
  md: styles.placeholderTextMd,
  lg: styles.placeholderTextLg,
};

const textSizeStyles = {
  sm: styles.textSm,
  md: styles.textMd,
  lg: styles.textLg,
};

import { Platform, type TextStyle, type ViewStyle } from "react-native";
import { Colors } from "./colors";

function platformShadow({
  androidElevation,
  boxShadow,
  color,
  offsetY,
  opacity,
  radius,
}: {
  androidElevation: number;
  boxShadow: string;
  color: string;
  offsetY: number;
  opacity: number;
  radius: number;
}): ViewStyle {
  return (
    Platform.select<ViewStyle>({
      web: { boxShadow },
      ios: {
        shadowColor: color,
        shadowOffset: { height: offsetY, width: 0 },
        shadowOpacity: opacity,
        shadowRadius: radius,
      },
      android: {
        elevation: androidElevation,
        shadowColor: color,
      },
      default: {},
    }) ?? {}
  );
}

const noShadow = {} satisfies ViewStyle;

const subtleShadow = platformShadow({
  androidElevation: 1,
  boxShadow: "0 1px 3px rgba(16, 18, 20, 0.08)",
  color: Colors.shellBackground,
  offsetY: 1,
  opacity: 0.08,
  radius: 3,
});

const elevatedShadow = platformShadow({
  androidElevation: 3,
  boxShadow: "0 10px 28px rgba(16, 18, 20, 0.12)",
  color: Colors.shellBackground,
  offsetY: 8,
  opacity: 0.12,
  radius: 20,
});

const floatingShadow = platformShadow({
  androidElevation: 6,
  boxShadow: "0 18px 44px rgba(16, 18, 20, 0.18)",
  color: Colors.shellBackground,
  offsetY: 16,
  opacity: 0.18,
  radius: 28,
});

export const Shadows = {
  none: noShadow,
  subtle: subtleShadow,
  elevated: elevatedShadow,
  floating: floatingShadow,

  // Compatibility aliases. Buttons intentionally have no glow or elevation.
  card: subtleShadow,
  button: noShadow,
} as const;

export const TextShadows = {
  onImage:
    Platform.OS === "web"
      ? ({
          textShadow: "0 1px 4px rgba(16, 18, 20, 0.52)",
        } as unknown as TextStyle)
      : ({
          textShadowColor: "rgba(16, 18, 20, 0.52)",
          textShadowOffset: { height: 1, width: 0 },
          textShadowRadius: 4,
        } satisfies TextStyle),
} as const;

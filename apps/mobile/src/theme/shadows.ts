import { Platform, type TextStyle, type ViewStyle } from "react-native";

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

export const Shadows = {
  none: {} satisfies ViewStyle,
  card: platformShadow({
    androidElevation: 1,
    boxShadow: "0 8px 24px rgba(21, 48, 88, 0.07)",
    color: "#153058",
    offsetY: 8,
    opacity: 0.07,
    radius: 16,
  }),
  elevated: platformShadow({
    androidElevation: 3,
    boxShadow: "0 14px 32px rgba(21, 48, 88, 0.11)",
    color: "#153058",
    offsetY: 12,
    opacity: 0.11,
    radius: 22,
  }),
  floating: platformShadow({
    androidElevation: 6,
    boxShadow: "0 18px 42px rgba(8, 17, 42, 0.16)",
    color: "#08112A",
    offsetY: 16,
    opacity: 0.16,
    radius: 28,
  }),
  button: platformShadow({
    androidElevation: 1,
    boxShadow: "0 5px 14px rgba(20, 92, 255, 0.16)",
    color: "#145CFF",
    offsetY: 5,
    opacity: 0.14,
    radius: 10,
  }),
} as const;

export const TextShadows = {
  onImage:
    Platform.OS === "web"
      ? ({ textShadow: "0 1px 4px rgba(0, 0, 0, 0.38)" } as unknown as TextStyle)
      : ({
          textShadowColor: "rgba(0, 0, 0, 0.38)",
          textShadowOffset: { height: 1, width: 0 },
          textShadowRadius: 4,
        } satisfies TextStyle),
} as const;

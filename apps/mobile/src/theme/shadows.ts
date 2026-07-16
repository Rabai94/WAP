import type { ViewStyle } from "react-native";

export const Shadows = {
  none: {} satisfies ViewStyle,
  card: {
    elevation: 2,
    shadowColor: "#153058",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.07,
    shadowRadius: 20,
  } satisfies ViewStyle,
  button: {
    elevation: 2,
    shadowColor: "#145CFF",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
  } satisfies ViewStyle,
} as const;

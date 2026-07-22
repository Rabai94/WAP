import { Platform, type ViewStyle } from "react-native";
import { Colors } from "./colors";

export const InteractionStyles = {
  pointer:
    Platform.OS === "web"
      ? ({ cursor: "pointer" } as unknown as ViewStyle)
      : ({} satisfies ViewStyle),
  focusRing:
    Platform.OS === "web"
      ? ({
          outlineColor: Colors.focusRing,
          outlineOffset: 2,
          outlineStyle: "solid",
          outlineWidth: 2,
        } as unknown as ViewStyle)
      : ({} satisfies ViewStyle),
} as const;

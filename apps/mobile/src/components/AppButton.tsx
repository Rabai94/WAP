import { Pressable, StyleSheet, Text } from "react-native";

type AppButtonProps = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
};

export default function AppButton({
  title,
  onPress,
  variant = "primary",
}: AppButtonProps) {
  return (
    <Pressable
      style={[
        styles.button,
        variant === "primary" && styles.primaryButton,
        variant === "secondary" && styles.secondaryButton,
        variant === "danger" && styles.dangerButton,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.text,
          variant === "primary" && styles.primaryText,
          variant === "secondary" && styles.secondaryText,
          variant === "danger" && styles.dangerText,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButton: {
    backgroundColor: "#8B5A24",
  },

  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#8B5A24",
  },

  dangerButton: {
    backgroundColor: "#B3261E",
  },

  text: {
    fontSize: 17,
    fontWeight: "800",
  },

  primaryText: {
    color: "#FFFFFF",
  },

  secondaryText: {
    color: "#8B5A24",
  },

  dangerText: {
    color: "#FFFFFF",
  },
});
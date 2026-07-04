import { Pressable, StyleSheet, Text } from "react-native";

type ButtonProps = {
  title: string;
  onPress?: () => void;
};

export default function Button({ title, onPress }: ButtonProps) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#8B5A24",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
import { StyleProp, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from "react-native";
import { Colors, Radius, Spacing, Typography } from "@/theme";

type InputProps = TextInputProps & {
  label: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export default function Input({
  label,
  containerStyle,
  placeholderTextColor = Colors.placeholder,
  style,
  ...props
}: InputProps) {
  return (
    <View style={containerStyle}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={placeholderTextColor}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: Typography.label,
    fontWeight: Typography.fontWeight.extraBold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },

  input: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    borderWidth: 1,
    color: Colors.text,
    fontSize: Typography.body,
    marginBottom: Spacing.xxl,
    minHeight: 50,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.xl,
  },
});

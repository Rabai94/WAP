import {
  RabAIButton,
  type RabAIButtonVariant,
} from "@/components/ui";

export type OrganizationActionButtonVariant =
  | "primary"
  | "secondary"
  | "ghost";

export type OrganizationActionButtonProps = {
  accessibilityHint?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  label: string;
  onPress: () => void;
  testID?: string;
  variant?: OrganizationActionButtonVariant;
};

const variantMap: Record<
  OrganizationActionButtonVariant,
  RabAIButtonVariant
> = {
  ghost: "ghost",
  primary: "primary",
  secondary: "secondary",
};

export default function OrganizationActionButton({
  accessibilityHint,
  disabled = false,
  fullWidth = false,
  label,
  onPress,
  testID,
  variant = "primary",
}: OrganizationActionButtonProps) {
  return (
    <RabAIButton
      accessibilityHint={accessibilityHint}
      disabled={disabled}
      fullWidth={fullWidth}
      onPress={onPress}
      testID={testID}
      title={label}
      variant={variantMap[variant]}
    />
  );
}

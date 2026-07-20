import type {
  CredentialDocumentStatus,
  CredentialStatus,
} from "@/services/credentials/credentialService";
import { Colors, Radius, Spacing, Typography } from "@/theme";
import { StyleSheet, Text, View } from "react-native";

type Status = CredentialDocumentStatus | CredentialStatus;

type CredentialStatusBadgeProps = {
  label: string;
  status: Status;
};

export default function CredentialStatusBadge({
  label,
  status,
}: CredentialStatusBadgeProps) {
  const symbol = status === "valid" || status === "ready"
    ? "✓"
    : status === "pending"
      ? "…"
      : "!";

  return (
    <View
      accessibilityLabel={label}
      style={[
        styles.badge,
        status === "valid" || status === "ready"
          ? styles.success
          : status === "pending"
            ? styles.pending
            : styles.danger,
      ]}
    >
      <Text style={styles.text}>{`${symbol} ${label}`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: Radius.round,
    borderWidth: 1,
    minHeight: 32,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  success: {
    backgroundColor: "#E8F8F2",
    borderColor: "#8AD8BC",
  },
  pending: {
    backgroundColor: Colors.warningSurface,
    borderColor: Colors.warningBorder,
  },
  danger: {
    backgroundColor: "#FFF1F3",
    borderColor: "#FDA4AF",
  },
  text: {
    color: Colors.text,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.extraBold,
  },
});

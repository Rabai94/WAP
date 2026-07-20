import { Button } from "@/components/ui";
import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import {
  AccessibilityInfo,
  Modal,
  Platform,
  StyleSheet,
  Text,
  View,
  findNodeHandle,
} from "react-native";
import type { ReactNode, RefObject } from "react";
import { useEffect, useRef } from "react";

type FocusableView = View & { focus?: () => void };

type CredentialConfirmDialogProps = {
  cancelLabel: string;
  children?: ReactNode;
  confirmLabel: string;
  danger?: boolean;
  loading: boolean;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  returnFocusRef?: RefObject<FocusableView | null>;
  title: string;
  visible: boolean;
};

export default function CredentialConfirmDialog({
  cancelLabel,
  children,
  confirmLabel,
  danger = false,
  loading,
  message,
  onCancel,
  onConfirm,
  returnFocusRef,
  title,
  visible,
}: CredentialConfirmDialogProps) {
  const wasVisible = useRef(false);
  const webReturnFocusRef = useRef<{ focus?: () => void } | null>(null);

  useEffect(() => {
    if (visible) {
      if (Platform.OS === "web") {
        webReturnFocusRef.current = globalThis.document?.activeElement as {
          focus?: () => void;
        } | null;
      }
      wasVisible.current = true;
      return;
    }

    if (!wasVisible.current) {
      return;
    }

    wasVisible.current = false;
    if (Platform.OS === "web") {
      const webTarget = returnFocusRef?.current ?? webReturnFocusRef.current;
      webTarget?.focus?.();
      return;
    }

    const nativeTarget = returnFocusRef?.current;
    if (!nativeTarget) {
      return;
    }

    const handle = findNodeHandle(nativeTarget);
    if (handle) {
      AccessibilityInfo.setAccessibilityFocus(handle);
    }
  }, [returnFocusRef, visible]);

  useEffect(() => {
    if (!visible || Platform.OS !== "web") {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        event.preventDefault();
        onCancel();
      }
    };

    globalThis.addEventListener("keydown", handleKeyDown);
    return () => globalThis.removeEventListener("keydown", handleKeyDown);
  }, [loading, onCancel, visible]);

  return (
    <Modal
      animationType="fade"
      onRequestClose={() => {
        if (!loading) {
          onCancel();
        }
      }}
      transparent
      visible={visible}
    >
      <View accessibilityViewIsModal style={styles.backdrop}>
        <View style={styles.dialog}>
          <Text accessibilityRole="header" style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          {children}
          <View style={styles.actions}>
            <Button
              disabled={loading}
              onPress={onCancel}
              style={styles.action}
              title={cancelLabel}
              variant="secondary"
            />
            <Button
              disabled={loading}
              onPress={onConfirm}
              style={styles.action}
              title={loading ? `${confirmLabel}…` : confirmLabel}
              variant={danger ? "danger" : "primary"}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: "center",
    backgroundColor: "rgba(10, 16, 40, 0.55)",
    flex: 1,
    justifyContent: "center",
    padding: Spacing.three,
  },
  dialog: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    maxWidth: 560,
    padding: Spacing.screen,
    width: "100%",
    ...Shadows.card,
  },
  title: {
    color: Colors.text,
    fontSize: Typography.h4,
    fontWeight: Typography.fontWeight.extraBold,
    marginBottom: Spacing.md,
  },
  message: {
    color: Colors.textBody,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.default,
    marginBottom: Spacing.lg,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    justifyContent: "flex-end",
    marginTop: Spacing.lg,
  },
  action: {
    flexGrow: 1,
    minWidth: 140,
  },
});

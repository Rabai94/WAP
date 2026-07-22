import {
  useEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import {
  AccessibilityInfo,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  findNodeHandle,
  useWindowDimensions,
} from "react-native";
import {
  Breakpoints,
  Colors,
  Layers,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "@/theme";
import { RabAIButton } from "./Button";

export type ConfirmationDialogProps = {
  visible: boolean;
  title: string;
  description?: string;
  children?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  returnFocusRef?: RefObject<View | null>;
  testID?: string;
};

export default function ConfirmationDialog({
  cancelLabel = "Anulează",
  children,
  confirmLabel,
  description,
  destructive = false,
  loading = false,
  onCancel,
  onConfirm,
  returnFocusRef,
  testID,
  title,
  visible,
}: ConfirmationDialogProps) {
  const { width } = useWindowDimensions();
  const cancelRef = useRef<View>(null);
  const confirmRef = useRef<View>(null);
  const wasVisibleRef = useRef(false);
  const compact = width < Breakpoints.mobile;

  useEffect(() => {
    if (!visible) {
      return;
    }

    const timeoutId = setTimeout(() => focusNode(cancelRef.current), 0);
    return () => clearTimeout(timeoutId);
  }, [visible]);

  useEffect(() => {
    if (wasVisibleRef.current && !visible) {
      focusNode(returnFocusRef?.current ?? null);
    }

    wasVisibleRef.current = visible;
  }, [returnFocusRef, visible]);

  function restoreFocus() {
    focusNode(returnFocusRef?.current ?? null);
  }

  return (
    <Modal
      animationType="fade"
      onDismiss={restoreFocus}
      onRequestClose={() => {
        if (!loading) {
          onCancel();
        }
      }}
      transparent
      visible={visible}
    >
      <View style={styles.layer}>
        <Pressable
          accessibilityLabel="Închide dialogul"
          accessibilityRole="button"
          disabled={loading}
          onPress={onCancel}
          style={styles.backdrop}
        />
        <View
          accessibilityLabel={title}
          accessibilityViewIsModal
          onAccessibilityEscape={() => {
            if (!loading) {
              onCancel();
            }
          }}
          role="dialog"
          style={[styles.dialog, compact && styles.dialogCompact]}
          testID={testID}
        >
          <Text accessibilityRole="header" style={styles.title}>
            {title}
          </Text>
          {description ? <Text style={styles.description}>{description}</Text> : null}
          {children ? <View style={styles.content}>{children}</View> : null}
          <View style={[styles.actions, compact && styles.actionsCompact]}>
            <RabAIButton
              ref={cancelRef}
              disabled={loading}
              fullWidth={compact}
              onPress={onCancel}
              title={cancelLabel}
              variant="outline"
            />
            <RabAIButton
              ref={confirmRef}
              fullWidth={compact}
              loading={loading}
              loadingLabel={confirmLabel}
              onPress={onConfirm}
              title={confirmLabel}
              variant={destructive ? "destructive" : "primary"}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function focusNode(node: View | null) {
  if (!node) {
    return;
  }

  if (Platform.OS === "web") {
    (node as View & { focus?: () => void }).focus?.();
    return;
  }

  const handle = findNodeHandle(node);

  if (handle) {
    AccessibilityInfo.setAccessibilityFocus(handle);
  }
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.component,
    zIndex: Layers.modal,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.overlay,
  },
  dialog: {
    backgroundColor: Colors.surfaceElevated,
    borderColor: Colors.border,
    borderRadius: Radius.dialog,
    borderWidth: 1,
    maxHeight: "90%",
    maxWidth: 520,
    padding: Spacing.section,
    width: "100%",
    ...Shadows.floating,
  },
  dialogCompact: {
    borderRadius: Radius.panel,
    padding: Spacing.component,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.h3,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: 32,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
    lineHeight: Typography.lineHeight.default,
    marginTop: Spacing.control,
  },
  content: {
    marginTop: Spacing.component,
  },
  actions: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.control,
    justifyContent: "flex-end",
    marginTop: Spacing.section,
  },
  actionsCompact: {
    alignItems: "stretch",
    flexDirection: "column-reverse",
  },
});

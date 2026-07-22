import { useReducedMotion } from "@/components/ui/useReducedMotion";
import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import { useCallback, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type CourseEnrollmentWithdrawalConfirmDialogProps = {
  courseTitle: string;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
  providerName: string;
  submitting: boolean;
  visible: boolean;
};

type WebPressableState = {
  focused?: boolean;
  hovered?: boolean;
  pressed?: boolean;
};

type FocusTarget = {
  focus: () => void;
};

type GlobalKeyboardTarget = {
  addEventListener?: (
    type: "keydown",
    listener: (event: { key?: string }) => void
  ) => void;
  removeEventListener?: (
    type: "keydown",
    listener: (event: { key?: string }) => void
  ) => void;
};

const pointerWebStyle =
  Platform.OS === "web"
    ? ({ cursor: "pointer" } as unknown as ViewStyle)
    : null;

export default function CourseEnrollmentWithdrawalConfirmDialog(
  props: CourseEnrollmentWithdrawalConfirmDialogProps
) {
  if (!props.visible) {
    return null;
  }

  return <CourseEnrollmentWithdrawalConfirmDialogPanel {...props} />;
}

function CourseEnrollmentWithdrawalConfirmDialogPanel({
  courseTitle,
  error,
  onCancel,
  onConfirm,
  providerName,
  submitting,
  visible,
}: CourseEnrollmentWithdrawalConfirmDialogProps) {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const cancelButtonRef = useRef<View | null>(null);
  const confirmLockRef = useRef(false);
  const returnFocusRef = useRef<FocusTarget | null>(null);
  const isNarrow = width < 380;
  const horizontalPadding = Spacing.three;
  const topPadding = Math.max(insets.top, Spacing.three);
  const bottomPadding = Math.max(insets.bottom, Spacing.three);
  const dialogWidth = Math.min(
    536,
    Math.max(width - horizontalPadding * 2, 0)
  );
  const dialogMaxHeight = Math.max(height - topPadding - bottomPadding, 0);

  const requestCancel = useCallback(() => {
    if (!submitting) {
      confirmLockRef.current = false;
      onCancel();
    }
  }, [onCancel, submitting]);

  useEffect(() => {
    if (!submitting) {
      confirmLockRef.current = false;
    }
  }, [submitting]);

  useEffect(() => {
    if (!visible || Platform.OS !== "web") {
      return;
    }

    returnFocusRef.current = globalThis.document
      ?.activeElement as FocusTarget | null;

    const focusTimer = setTimeout(() => {
      focusIfAvailable(cancelButtonRef.current);
    }, 0);

    return () => {
      clearTimeout(focusTimer);
      const target = returnFocusRef.current;
      returnFocusRef.current = null;
      setTimeout(() => focusIfAvailable(target), 0);
    };
  }, [visible]);

  useEffect(() => {
    if (!visible || Platform.OS !== "web") {
      return;
    }

    const keyboardTarget = globalThis as unknown as GlobalKeyboardTarget;
    const handleKeyDown = (event: { key?: string }) => {
      if (event.key === "Escape") {
        requestCancel();
      }
    };

    keyboardTarget.addEventListener?.("keydown", handleKeyDown);
    return () => {
      keyboardTarget.removeEventListener?.("keydown", handleKeyDown);
    };
  }, [requestCancel, visible]);

  function requestConfirm() {
    if (submitting || confirmLockRef.current) {
      return;
    }

    confirmLockRef.current = true;
    onConfirm();
  }

  return (
    <Modal
      animationType={reducedMotion ? "none" : "fade"}
      onRequestClose={requestCancel}
      presentationStyle="overFullScreen"
      transparent
      visible={visible}
    >
      <View
        style={[
          styles.modalRoot,
          {
            paddingBottom: bottomPadding,
            paddingHorizontal: horizontalPadding,
            paddingTop: topPadding,
          },
        ]}
      >
        <Pressable
          accessibilityLabel="Închide confirmarea retragerii"
          accessibilityRole="button"
          accessibilityState={{ disabled: submitting }}
          disabled={submitting}
          onPress={requestCancel}
          style={styles.backdrop}
        />

        <View
          accessibilityLabel={`Confirmă retragerea înscrierii la cursul ${courseTitle}`}
          accessibilityViewIsModal
          onAccessibilityEscape={requestCancel}
          role="dialog"
          style={[
            styles.dialog,
            { maxHeight: dialogMaxHeight, width: dialogWidth },
          ]}
          testID="course-enrollment-withdrawal-confirm-dialog"
        >
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            style={styles.scroll}
          >
            <View style={styles.heading}>
              <Text style={styles.eyebrow}>Confirmare retragere</Text>
              <Text style={styles.title}>Retragi înscrierea?</Text>
              <Text style={styles.subtitle}>
                {courseTitle} · {providerName}
              </Text>
            </View>

            <View style={styles.warningNotice}>
              <Text style={styles.warningTitle}>
                Cererea ta va fi retrasă.
              </Text>
              <Text style={styles.warningText}>
                Înscrierea rămâne în istoric cu statusul „Retrasă”. Pentru
                același curs nu vei putea trimite o înscriere nouă cât timp
                backend-ul păstrează regula actuală de unicitate.
              </Text>
            </View>

            {error ? (
              <Text accessibilityRole="alert" style={styles.errorText}>
                {error}
              </Text>
            ) : null}
          </ScrollView>

          <View style={[styles.actions, isNarrow && styles.actionsNarrow]}>
            <Pressable
              accessibilityLabel="Păstrează înscrierea"
              accessibilityRole="button"
              accessibilityState={{ disabled: submitting }}
              disabled={submitting}
              onPress={requestCancel}
              ref={cancelButtonRef}
              style={(state) => {
                const webState = state as WebPressableState;

                return [
                  styles.secondaryButton,
                  isNarrow && styles.buttonNarrow,
                  pointerWebStyle,
                  submitting && styles.buttonDisabled,
                  !submitting && webState.hovered && styles.secondaryButtonHover,
                  webState.focused && styles.secondaryButtonFocus,
                  !submitting && webState.pressed && styles.buttonPressed,
                ];
              }}
            >
              <Text style={styles.secondaryButtonText}>
                Păstrează înscrierea
              </Text>
            </Pressable>

            <Pressable
              accessibilityLabel="Confirmă retragerea înscrierii"
              accessibilityRole="button"
              accessibilityState={{ busy: submitting, disabled: submitting }}
              disabled={submitting}
              onPress={requestConfirm}
              style={(state) => {
                const webState = state as WebPressableState;

                return [
                  styles.dangerButton,
                  isNarrow && styles.buttonNarrow,
                  pointerWebStyle,
                  submitting && styles.dangerButtonDisabled,
                  !submitting && webState.hovered && styles.dangerButtonHover,
                  webState.focused && styles.dangerButtonFocus,
                  !submitting && webState.pressed && styles.buttonPressed,
                ];
              }}
              testID="confirm-course-enrollment-withdrawal"
            >
              {submitting ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.dangerButtonText}>
                  Confirmă retragerea
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function focusIfAvailable(value: unknown) {
  if (!isFocusTarget(value)) {
    return;
  }

  try {
    value.focus();
  } catch {
    // The dialog can close before the deferred focus runs.
  }
}

function isFocusTarget(value: unknown): value is FocusTarget {
  return (
    typeof value === "object" &&
    value !== null &&
    "focus" in value &&
    typeof value.focus === "function"
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.overlayStrong,
  },
  dialog: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    maxWidth: "100%",
    minWidth: 0,
    overflow: "hidden",
    ...Shadows.card,
  },
  scroll: {
    flexShrink: 1,
    minHeight: 0,
  },
  content: {
    gap: Spacing.three,
    padding: Spacing.screen,
  },
  heading: {
    gap: Spacing.sm,
  },
  eyebrow: {
    color: Colors.danger,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.extraBold,
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  title: {
    color: Colors.text,
    fontSize: Typography.h4,
    fontWeight: Typography.fontWeight.black,
    lineHeight: 26,
  },
  subtitle: {
    color: Colors.textSubtle,
    fontSize: Typography.bodySmall,
    lineHeight: 20,
  },
  warningNotice: {
    backgroundColor: Colors.dangerSurface,
    borderColor: Colors.dangerBorder,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.md,
    padding: Spacing.three,
  },
  warningTitle: {
    color: Colors.danger,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
  },
  warningText: {
    color: Colors.textBody,
    fontSize: Typography.bodySmall,
    lineHeight: 21,
  },
  errorText: {
    color: Colors.danger,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: 20,
  },
  actions: {
    borderColor: Colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: Spacing.md,
    padding: Spacing.three,
  },
  actionsNarrow: {
    flexDirection: "column",
  },
  buttonNarrow: {
    flexGrow: 0,
    width: "100%",
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 48,
    minWidth: 0,
    paddingHorizontal: Spacing.three,
  },
  secondaryButtonHover: {
    backgroundColor: Colors.surfaceMuted,
  },
  secondaryButtonFocus: {
    borderColor: Colors.brand,
  },
  secondaryButtonText: {
    color: Colors.textBody,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
    textAlign: "center",
  },
  dangerButton: {
    alignItems: "center",
    backgroundColor: Colors.danger,
    borderColor: Colors.danger,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flex: 1.2,
    justifyContent: "center",
    minHeight: 48,
    minWidth: 0,
    paddingHorizontal: Spacing.three,
  },
  dangerButtonHover: {
    backgroundColor: Colors.danger,
    borderColor: Colors.danger,
  },
  dangerButtonFocus: {
    borderColor: Colors.text,
  },
  dangerButtonDisabled: {
    backgroundColor: Colors.dangerBorder,
    borderColor: Colors.dangerBorder,
  },
  dangerButtonText: {
    color: Colors.white,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
    textAlign: "center",
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonPressed: {
    opacity: 0.84,
  },
});

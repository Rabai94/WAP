import { useReducedMotion } from "@/components/ui/useReducedMotion";
import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type CourseEnrollmentConfirmDialogProps = {
  alreadyEnrolled: boolean;
  courseDetailsError: string | null;
  courseDetailsLoading: boolean;
  courseTitle: string;
  courseUnavailable: boolean;
  enrollmentContextError: string | null;
  existingEnrollmentStatusLabel: string | null;
  loadingEnrollmentContext: boolean;
  onCancel: () => void;
  onConfirm: (message: string | null) => void;
  onRetryCourseDetails: () => void;
  onRetryEnrollmentContext: () => void;
  providerName: string;
  submissionError: string | null;
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

export default function CourseEnrollmentConfirmDialog(
  props: CourseEnrollmentConfirmDialogProps
) {
  if (!props.visible) {
    return null;
  }

  return <CourseEnrollmentConfirmDialogPanel {...props} />;
}

function CourseEnrollmentConfirmDialogPanel({
  alreadyEnrolled,
  courseDetailsError,
  courseDetailsLoading,
  courseTitle,
  courseUnavailable,
  enrollmentContextError,
  existingEnrollmentStatusLabel,
  loadingEnrollmentContext,
  onCancel,
  onConfirm,
  onRetryCourseDetails,
  onRetryEnrollmentContext,
  providerName,
  submissionError,
  submitting,
  visible,
}: CourseEnrollmentConfirmDialogProps) {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const [message, setMessage] = useState("");
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
  const visibleStatusLabel = existingEnrollmentStatusLabel?.trim() || null;
  const canSubmit =
    !alreadyEnrolled &&
    !courseDetailsError &&
    !courseDetailsLoading &&
    !courseUnavailable &&
    !enrollmentContextError &&
    !loadingEnrollmentContext &&
    !submitting;

  const requestCancel = useCallback(() => {
    if (!submitting) {
      setMessage("");
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
    if (!canSubmit || confirmLockRef.current) {
      return;
    }

    confirmLockRef.current = true;
    onConfirm(message.trim() || null);
  }

  const confirmLabel = alreadyEnrolled
    ? "Înscriere existentă"
    : submitting
      ? "Se trimite…"
      : "Trimite înscrierea";

  return (
    <Modal
      animationType={reducedMotion ? "none" : "fade"}
      onRequestClose={requestCancel}
      presentationStyle="overFullScreen"
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
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
          accessibilityLabel="Închide confirmarea înscrierii"
          accessibilityRole="button"
          accessibilityState={{ disabled: submitting }}
          disabled={submitting}
          onPress={requestCancel}
          style={styles.backdrop}
        />

        <View
          accessibilityLabel={`Confirmă înscrierea la cursul ${courseTitle}`}
          accessibilityViewIsModal
          onAccessibilityEscape={requestCancel}
          role="dialog"
          style={[
            styles.dialog,
            {
              maxHeight: dialogMaxHeight,
              width: dialogWidth,
            },
          ]}
          testID="course-enrollment-confirm-dialog"
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={styles.scroll}
          >
            <View style={styles.heading}>
              <Text style={styles.eyebrow}>Confirmare înscriere</Text>
              <Text style={styles.title}>Trimite înscrierea?</Text>
              <Text style={styles.subtitle}>
                {courseTitle} · {providerName}
              </Text>
            </View>

            {loadingEnrollmentContext || courseDetailsLoading ? (
              <View accessibilityLiveRegion="polite" style={styles.loadingRow}>
                <ActivityIndicator color={Colors.brand} />
                <Text style={styles.loadingText}>
                  Verificăm cursul și înscrierile existente…
                </Text>
              </View>
            ) : null}

            {courseDetailsError ? (
              <Notice tone="danger" title="Cursul nu a putut fi verificat">
                <Text style={styles.noticeText}>{courseDetailsError}</Text>
                <RetryButton
                  label="Reîncearcă încărcarea cursului"
                  onPress={onRetryCourseDetails}
                  testID="retry-course-details"
                />
              </Notice>
            ) : null}

            {enrollmentContextError ? (
              <Notice tone="danger" title="Verificarea înscrierilor nu a reușit">
                <Text style={styles.noticeText}>{enrollmentContextError}</Text>
                <RetryButton
                  label="Reîncearcă verificarea înscrierilor"
                  onPress={onRetryEnrollmentContext}
                  testID="retry-course-enrollments"
                />
              </Notice>
            ) : null}

            {alreadyEnrolled ? (
              <Notice tone="info" title="Ai deja o înscriere">
                <Text style={styles.noticeText}>
                  Pentru acest curs există deja o înscriere în contul tău.
                  {visibleStatusLabel
                    ? ` Status curent: ${visibleStatusLabel}.`
                    : ""}
                </Text>
              </Notice>
            ) : null}

            {courseUnavailable ? (
              <Notice tone="danger" title="Curs indisponibil">
                <Text style={styles.noticeText}>
                  Cursul nu mai este disponibil pentru înscriere.
                </Text>
              </Notice>
            ) : null}

            {!loadingEnrollmentContext &&
            !courseDetailsLoading &&
            !courseDetailsError &&
            !enrollmentContextError &&
            !alreadyEnrolled &&
            !courseUnavailable ? (
              <View style={styles.messageBlock}>
                <Text style={styles.inputLabel}>Mesaj opțional</Text>
                <TextInput
                  accessibilityLabel="Mesaj opțional pentru furnizorul cursului"
                  multiline
                  onChangeText={setMessage}
                  placeholder="Adaugă un mesaj scurt pentru furnizor"
                  placeholderTextColor={Colors.placeholder}
                  style={styles.messageInput}
                  textAlignVertical="top"
                  value={message}
                />
                <Text style={styles.helperText}>
                  Înscrierea nu este trimisă până când nu confirmi mai jos.
                </Text>
              </View>
            ) : null}

            {submissionError ? (
              <Text accessibilityRole="alert" style={styles.errorText}>
                {submissionError}
              </Text>
            ) : null}
          </ScrollView>

          <View style={[styles.actions, isNarrow && styles.actionsNarrow]}>
            <Pressable
              accessibilityLabel="Anulează înscrierea"
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
              testID="cancel-course-enrollment"
            >
              <Text style={styles.secondaryButtonText}>Anulează</Text>
            </Pressable>

            <Pressable
              accessibilityLabel={confirmLabel}
              accessibilityRole="button"
              accessibilityState={{ busy: submitting, disabled: !canSubmit }}
              disabled={!canSubmit}
              onPress={requestConfirm}
              style={(state) => {
                const webState = state as WebPressableState;

                return [
                  styles.primaryButton,
                  isNarrow && styles.buttonNarrow,
                  pointerWebStyle,
                  !canSubmit && styles.primaryButtonDisabled,
                  canSubmit && webState.hovered && styles.primaryButtonHover,
                  webState.focused && styles.primaryButtonFocus,
                  canSubmit && webState.pressed && styles.buttonPressed,
                ];
              }}
              testID="confirm-course-enrollment"
            >
              {submitting ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>{confirmLabel}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
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

function RetryButton({
  label,
  onPress,
  testID,
}: {
  label: string;
  onPress: () => void;
  testID: string;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={(state) => {
        const webState = state as WebPressableState;

        return [
          styles.inlineButton,
          pointerWebStyle,
          webState.hovered && styles.inlineButtonHover,
          webState.focused && styles.inlineButtonFocus,
          webState.pressed && styles.buttonPressed,
        ];
      }}
      testID={testID}
    >
      <Text style={styles.inlineButtonText}>Reîncearcă</Text>
    </Pressable>
  );
}

function Notice({
  children,
  title,
  tone,
}: {
  children: ReactNode;
  title: string;
  tone: "danger" | "info";
}) {
  return (
    <View
      style={[
        styles.notice,
        tone === "danger" ? styles.noticeDanger : styles.noticeInfo,
      ]}
    >
      <Text style={styles.noticeTitle}>{title}</Text>
      {children}
    </View>
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
    minWidth: 0,
  },
  eyebrow: {
    color: Colors.brand,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.extraBold,
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  title: {
    color: Colors.text,
    flexShrink: 1,
    fontSize: Typography.h4,
    fontWeight: Typography.fontWeight.black,
    lineHeight: 26,
  },
  subtitle: {
    color: Colors.textSubtle,
    flexShrink: 1,
    fontSize: Typography.bodySmall,
    lineHeight: 20,
  },
  loadingRow: {
    alignItems: "center",
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.lg,
    flexDirection: "row",
    gap: Spacing.xl,
    maxWidth: "100%",
    minWidth: 0,
    padding: Spacing.three,
  },
  loadingText: {
    color: Colors.textSubtle,
    flex: 1,
    flexShrink: 1,
    fontSize: Typography.bodySmall,
    lineHeight: 20,
    minWidth: 0,
  },
  notice: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.md,
    maxWidth: "100%",
    minWidth: 0,
    padding: Spacing.three,
  },
  noticeDanger: {
    backgroundColor: Colors.dangerSurface,
    borderColor: Colors.dangerBorder,
  },
  noticeInfo: {
    backgroundColor: Colors.informationSurface,
    borderColor: Colors.informationBorder,
  },
  noticeTitle: {
    color: Colors.text,
    flexShrink: 1,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
  },
  noticeText: {
    color: Colors.textBody,
    flexShrink: 1,
    fontSize: Typography.bodySmall,
    lineHeight: 20,
  },
  inlineButton: {
    alignSelf: "flex-start",
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: Spacing.three,
  },
  inlineButtonHover: {
    backgroundColor: Colors.surfaceMuted,
  },
  inlineButtonFocus: {
    borderColor: Colors.brand,
  },
  inlineButtonText: {
    color: Colors.brandDeep,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
  },
  messageBlock: {
    gap: Spacing.md,
    minWidth: 0,
  },
  inputLabel: {
    color: Colors.textBody,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
  },
  messageInput: {
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    borderWidth: 1,
    color: Colors.text,
    fontSize: Typography.body,
    lineHeight: 22,
    maxWidth: "100%",
    minHeight: 112,
    minWidth: 0,
    padding: Spacing.three,
  },
  helperText: {
    color: Colors.textMuted,
    flexShrink: 1,
    fontSize: Typography.small,
    lineHeight: 18,
  },
  errorText: {
    color: Colors.danger,
    flexShrink: 1,
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
  primaryButton: {
    alignItems: "center",
    backgroundColor: Colors.goldPrimary,
    borderColor: Colors.goldPrimary,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flex: 1.35,
    justifyContent: "center",
    minHeight: 48,
    minWidth: 0,
    paddingHorizontal: Spacing.three,
  },
  primaryButtonHover: {
    backgroundColor: Colors.goldHover,
    borderColor: Colors.goldHover,
  },
  primaryButtonFocus: {
    borderColor: Colors.text,
  },
  primaryButtonDisabled: {
    backgroundColor: Colors.borderStrong,
    borderColor: Colors.borderStrong,
  },
  primaryButtonText: {
    color: Colors.onPrimary,
    flexShrink: 1,
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

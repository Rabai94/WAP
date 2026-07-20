import {
  Colors,
  ControlHeight,
  InteractionStyles,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "@/theme";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AccessibilityInfo,
  ActivityIndicator,
  findNodeHandle,
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
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type JobApplicationConfirmDialogProps = {
  alreadyApplied: boolean;
  applicationContextError: string | null;
  applicationStatusLabel: string | null;
  companyName: string;
  jobDetailsError: boolean;
  jobDetailsLoading: boolean;
  jobTitle: string;
  jobUnavailable: boolean;
  loadingApplicationContext: boolean;
  missingProfileFields: string[];
  onCancel: () => void;
  onCompleteProfile: () => void;
  onConfirm: (message: string | null) => void;
  onRetryApplicationContext: () => void;
  onRetryJobDetails: () => void;
  profileBlockMessage: string | null;
  submissionError: string | null;
  submitting: boolean;
  visible: boolean;
};

export default function JobApplicationConfirmDialog({
  alreadyApplied,
  applicationContextError,
  applicationStatusLabel,
  companyName,
  jobDetailsError,
  jobDetailsLoading,
  jobTitle,
  jobUnavailable,
  loadingApplicationContext,
  missingProfileFields,
  onCancel,
  onCompleteProfile,
  onConfirm,
  onRetryApplicationContext,
  onRetryJobDetails,
  profileBlockMessage,
  submissionError,
  submitting,
  visible,
}: JobApplicationConfirmDialogProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState("");
  const [dialogFocused, setDialogFocused] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const dialogRef = useRef<View>(null);
  const returnFocusRef = useRef<{ focus?: () => void } | null>(null);
  const dialogWidth = Math.min(536, Math.max(width - 32, 0));
  const hasProfileIssue =
    missingProfileFields.length > 0 || profileBlockMessage !== null;
  const canSubmit =
    !alreadyApplied &&
    !applicationContextError &&
    !hasProfileIssue &&
    !jobDetailsError &&
    !jobDetailsLoading &&
    !jobUnavailable &&
    !loadingApplicationContext &&
    !submitting;

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (Platform.OS === "web") {
      returnFocusRef.current = globalThis.document
        ?.activeElement as { focus?: () => void } | null;
    }

    const focusTimeoutId = setTimeout(() => focusView(dialogRef.current), 0);
    return () => {
      clearTimeout(focusTimeoutId);
      if (Platform.OS === "web") {
        const target = returnFocusRef.current;
        returnFocusRef.current = null;
        setTimeout(() => target?.focus?.(), 0);
      }
    };
  }, [visible]);

  return (
    <Modal
      animationType="fade"
      onRequestClose={onCancel}
      presentationStyle="overFullScreen"
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalRoot}
      >
        <Pressable
          accessibilityLabel="Închide confirmarea aplicării"
          accessibilityRole="button"
          onPress={onCancel}
          style={[styles.backdrop, InteractionStyles.pointer]}
        />
        <View
          accessibilityLabel={`Confirmă aplicarea la ${jobTitle}`}
          accessibilityViewIsModal
          focusable
          onAccessibilityEscape={onCancel}
          onBlur={(event) => {
            if (event.target === event.currentTarget) {
              setDialogFocused(false);
            }
          }}
          onFocus={(event) => {
            if (event.target === event.currentTarget) {
              setDialogFocused(true);
            }
          }}
          ref={dialogRef}
          role="dialog"
          style={[
            styles.dialog,
            {
              marginBottom: Math.max(insets.bottom, Spacing.three),
              width: dialogWidth,
            },
            dialogFocused && InteractionStyles.focusRing,
          ]}
          tabIndex={-1}
          testID="job-application-confirm-dialog"
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.heading}>
              <Text style={styles.eyebrow}>Confirmare aplicare</Text>
              <Text style={styles.title}>Trimite candidatura?</Text>
              <Text style={styles.subtitle}>
                {jobTitle} · {companyName}
              </Text>
            </View>

            {loadingApplicationContext || jobDetailsLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={Colors.brand} />
                <Text style={styles.loadingText}>
                  Verificăm jobul, profilul și aplicațiile existente…
                </Text>
              </View>
            ) : null}

            {jobDetailsError ? (
              <Notice tone="danger" title="Jobul nu a putut fi verificat">
                <Text style={styles.noticeText}>
                  Detaliile complete nu sunt disponibile momentan.
                </Text>
                <InteractivePressable
                  accessibilityRole="button"
                  hoverStyle={styles.inlineButtonHover}
                  onPress={onRetryJobDetails}
                  pressedStyle={styles.buttonPressed}
                  style={styles.inlineButton}
                >
                  <Text style={styles.inlineButtonText}>Reîncearcă</Text>
                </InteractivePressable>
              </Notice>
            ) : null}

            {applicationContextError ? (
              <Notice tone="danger" title="Verificarea nu a reușit">
                <Text style={styles.noticeText}>{applicationContextError}</Text>
                <InteractivePressable
                  accessibilityRole="button"
                  hoverStyle={styles.inlineButtonHover}
                  onPress={onRetryApplicationContext}
                  pressedStyle={styles.buttonPressed}
                  style={styles.inlineButton}
                >
                  <Text style={styles.inlineButtonText}>Reîncearcă</Text>
                </InteractivePressable>
              </Notice>
            ) : null}

            {alreadyApplied ? (
              <Notice tone="info" title="Ai aplicat deja">
                <Text style={styles.noticeText}>
                  Pentru acest job există deja o candidatură în contul tău.
                  {applicationStatusLabel
                    ? ` Status curent: ${applicationStatusLabel}.`
                    : ""}
                </Text>
              </Notice>
            ) : null}

            {jobUnavailable ? (
              <Notice tone="danger" title="Job indisponibil">
                <Text style={styles.noticeText}>
                  Anunțul nu mai este disponibil pentru aplicare.
                </Text>
              </Notice>
            ) : null}

            {profileBlockMessage || missingProfileFields.length > 0 ? (
              <Notice tone="warning" title="Completează profilul înainte">
                {profileBlockMessage ? (
                  <Text style={styles.noticeText}>{profileBlockMessage}</Text>
                ) : null}
                {missingProfileFields.length > 0 ? (
                  <View style={styles.missingList}>
                    <Text style={styles.missingIntro}>Câmpuri lipsă:</Text>
                    {missingProfileFields.map((field) => (
                      <Text key={field} style={styles.missingItem}>
                        • {field}
                      </Text>
                    ))}
                  </View>
                ) : null}
                <InteractivePressable
                  accessibilityRole="button"
                  hoverStyle={styles.inlineButtonHover}
                  onPress={onCompleteProfile}
                  pressedStyle={styles.buttonPressed}
                  style={styles.inlineButton}
                >
                  <Text style={styles.inlineButtonText}>Completează profilul</Text>
                </InteractivePressable>
              </Notice>
            ) : null}

            {!loadingApplicationContext &&
            !jobDetailsLoading &&
            !jobDetailsError &&
            !applicationContextError &&
            !alreadyApplied &&
            !jobUnavailable &&
            !hasProfileIssue ? (
              <View style={styles.messageBlock}>
                <Text style={styles.inputLabel}>Mesaj opțional</Text>
                <View
                  style={[
                    styles.messageInputFrame,
                    inputFocused && InteractionStyles.focusRing,
                  ]}
                >
                  <TextInput
                  accessibilityLabel="Mesaj opțional pentru angajator"
                  multiline
                  onBlur={() => setInputFocused(false)}
                  onChangeText={setMessage}
                  onFocus={() => setInputFocused(true)}
                  placeholder="Adaugă un mesaj scurt pentru companie"
                  placeholderTextColor={Colors.placeholder}
                  style={styles.messageInput}
                  textAlignVertical="top"
                  value={message}
                  />
                </View>
                <Text style={styles.helperText}>
                  Candidatura nu este trimisă până nu confirmi mai jos.
                </Text>
              </View>
            ) : null}

            {submissionError ? (
              <Text accessibilityRole="alert" style={styles.errorText}>
                {submissionError}
              </Text>
            ) : null}
          </ScrollView>

          <View style={styles.actions}>
            <InteractivePressable
              accessibilityRole="button"
              disabled={submitting}
              hoverStyle={styles.secondaryButtonHover}
              onPress={onCancel}
              pressedStyle={styles.buttonPressed}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Anulează</Text>
            </InteractivePressable>
            <InteractivePressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !canSubmit }}
              disabled={!canSubmit}
              hoverStyle={styles.primaryButtonHover}
              onPress={() => onConfirm(message.trim() || null)}
              pressedStyle={styles.buttonPressed}
              style={[
                styles.primaryButton,
                !canSubmit && styles.primaryButtonDisabled,
              ]}
              testID="confirm-job-application"
            >
              {submitting ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {alreadyApplied
                    ? "Candidatură existentă"
                    : "Trimite candidatura"}
                </Text>
              )}
            </InteractivePressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

type InteractivePressableProps = Omit<PressableProps, "style"> & {
  hoverStyle?: StyleProp<ViewStyle>;
  pressedStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
};

function InteractivePressable({
  disabled,
  hoverStyle,
  onBlur,
  onFocus,
  onHoverIn,
  onHoverOut,
  pressedStyle,
  style,
  ...props
}: InteractivePressableProps) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      {...props}
      disabled={disabled}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onHoverIn={(event) => {
        setHovered(true);
        onHoverIn?.(event);
      }}
      onHoverOut={(event) => {
        setHovered(false);
        onHoverOut?.(event);
      }}
      style={({ pressed }) => [
        style,
        !disabled && InteractionStyles.pointer,
        !disabled && hovered && hoverStyle,
        !disabled && pressed && pressedStyle,
        !disabled && focused && InteractionStyles.focusRing,
      ]}
    />
  );
}

function focusView(node: View | null) {
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

function Notice({
  children,
  title,
  tone,
}: {
  children: ReactNode;
  title: string;
  tone: "danger" | "info" | "warning";
}) {
  return (
    <View
      style={[
        styles.notice,
        tone === "danger"
          ? styles.noticeDanger
          : tone === "warning"
            ? styles.noticeWarning
            : styles.noticeInfo,
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
    padding: Spacing.three,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.overlay,
  },
  dialog: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    maxHeight: "90%",
    overflow: "hidden",
    ...Shadows.elevated,
  },
  content: {
    gap: Spacing.three,
    padding: Spacing.screen,
  },
  heading: {
    gap: Spacing.sm,
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
    fontSize: Typography.h4,
    fontWeight: Typography.fontWeight.black,
    lineHeight: 26,
  },
  subtitle: {
    color: Colors.textSubtle,
    fontSize: Typography.bodySmall,
    lineHeight: 20,
  },
  loadingRow: {
    alignItems: "center",
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.lg,
    flexDirection: "row",
    gap: Spacing.xl,
    padding: Spacing.three,
  },
  loadingText: {
    color: Colors.textSubtle,
    flex: 1,
    fontSize: Typography.bodySmall,
    lineHeight: 20,
  },
  notice: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.md,
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
  noticeWarning: {
    backgroundColor: Colors.warningSurface,
    borderColor: Colors.warningBorder,
  },
  noticeTitle: {
    color: Colors.text,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
  },
  noticeText: {
    color: Colors.textBody,
    fontSize: Typography.bodySmall,
    lineHeight: 20,
  },
  missingList: {
    gap: Spacing.xs,
  },
  missingIntro: {
    color: Colors.textBody,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
  },
  missingItem: {
    color: Colors.textBody,
    fontSize: Typography.bodySmall,
    lineHeight: 20,
  },
  inlineButton: {
    alignSelf: "flex-start",
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    borderWidth: 1,
    minHeight: ControlHeight.minimumTouch,
    justifyContent: "center",
    paddingHorizontal: Spacing.three,
  },
  inlineButtonText: {
    color: Colors.brandDeep,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
  },
  inlineButtonHover: {
    backgroundColor: Colors.surfaceInteractive,
    borderColor: Colors.borderStrong,
  },
  messageBlock: {
    gap: Spacing.md,
  },
  inputLabel: {
    color: Colors.textBody,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
  },
  messageInputFrame: {
    borderRadius: Radius.lg,
  },
  messageInput: {
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    borderWidth: 1,
    color: Colors.text,
    fontSize: Typography.body,
    lineHeight: 22,
    minHeight: 112,
    padding: Spacing.three,
  },
  helperText: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    lineHeight: 18,
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
  secondaryButton: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: Spacing.three,
  },
  secondaryButtonHover: {
    backgroundColor: Colors.surfaceMuted,
  },
  secondaryButtonText: {
    color: Colors.textBody,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: Colors.brand,
    borderRadius: Radius.lg,
    flex: 1.35,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: Spacing.three,
  },
  primaryButtonHover: {
    backgroundColor: Colors.brandDeep,
  },
  primaryButtonDisabled: {
    backgroundColor: Colors.surfaceDisabled,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
    textAlign: "center",
  },
  buttonPressed: {
    opacity: 0.84,
  },
});

import { Colors, Radius, Shadows, Spacing, Typography } from "@/theme";
import { useEffect, useRef } from "react";
import {
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
import type { CourseEnrollmentSnapshot } from "./courseQuickViewData";
import {
  canWithdrawCourseEnrollment,
  formatCourseEnrollmentStatus,
} from "./courseEnrollmentStatus";

type CourseEnrollmentStatusDialogProps = {
  courseTitle: string;
  enrollment: CourseEnrollmentSnapshot;
  notice?: string | null;
  onClose: () => void;
  onRequestWithdrawal: () => void;
  providerName: string;
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

const pointerWebStyle =
  Platform.OS === "web"
    ? ({ cursor: "pointer" } as unknown as ViewStyle)
    : null;

export default function CourseEnrollmentStatusDialog(
  props: CourseEnrollmentStatusDialogProps
) {
  if (!props.visible) {
    return null;
  }

  return <CourseEnrollmentStatusDialogPanel {...props} />;
}

function CourseEnrollmentStatusDialogPanel({
  courseTitle,
  enrollment,
  notice,
  onClose,
  onRequestWithdrawal,
  providerName,
  visible,
}: CourseEnrollmentStatusDialogProps) {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const closeButtonRef = useRef<View | null>(null);
  const canWithdraw = canWithdrawCourseEnrollment(enrollment.status);
  const horizontalPadding = Spacing.three;
  const topPadding = Math.max(insets.top, Spacing.three);
  const bottomPadding = Math.max(insets.bottom, Spacing.three);
  const dialogWidth = Math.min(
    560,
    Math.max(width - horizontalPadding * 2, 0)
  );
  const dialogMaxHeight = Math.max(height - topPadding - bottomPadding, 0);

  useEffect(() => {
    if (Platform.OS !== "web") {
      return;
    }

    const focusTimer = setTimeout(() => {
      focusIfAvailable(closeButtonRef.current);
    }, 0);

    return () => clearTimeout(focusTimer);
  }, []);

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
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
          accessibilityLabel="Închide starea înscrierii"
          accessibilityRole="button"
          onPress={onClose}
          style={styles.backdrop}
        />

        <View
          accessibilityLabel={`Starea înscrierii la cursul ${courseTitle}`}
          accessibilityViewIsModal
          role="dialog"
          style={[
            styles.dialog,
            { maxHeight: dialogMaxHeight, width: dialogWidth },
          ]}
          testID="course-enrollment-status-dialog"
        >
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            style={styles.scroll}
          >
            <View style={styles.heading}>
              <Text style={styles.eyebrow}>Înscriere la curs</Text>
              <Text style={styles.title}>Vezi starea</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>
                  {formatCourseEnrollmentStatus(enrollment.status)}
                </Text>
              </View>
            </View>

            {notice ? (
              <Text accessibilityRole="alert" style={styles.successNotice}>
                {notice}
              </Text>
            ) : null}

            <View style={styles.detailsGrid}>
              <StatusDetail label="Curs" value={courseTitle} />
              <StatusDetail label="Furnizor" value={providerName} />
              <StatusDetail
                label="Data înscrierii"
                value={formatEnrollmentDate(enrollment.created_at)}
              />
              <StatusDetail
                label="Status"
                value={formatCourseEnrollmentStatus(enrollment.status)}
              />
            </View>

            {enrollment.message?.trim() ? (
              <View style={styles.messageBlock}>
                <Text style={styles.detailLabel}>Mesaj trimis</Text>
                <Text style={styles.messageText}>
                  {enrollment.message.trim()}
                </Text>
              </View>
            ) : null}

            {enrollment.status === "accepted" ? (
              <View style={styles.infoNotice}>
                <Text style={styles.infoNoticeText}>
                  Anularea după acceptare necesită o politică separată a
                  furnizorului și nu este automatizată aici.
                </Text>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.actions}>
            <Pressable
              accessibilityLabel="Închide starea înscrierii"
              accessibilityRole="button"
              onPress={onClose}
              ref={closeButtonRef}
              style={(state) => {
                const webState = state as WebPressableState;

                return [
                  styles.secondaryButton,
                  pointerWebStyle,
                  webState.hovered && styles.secondaryButtonHover,
                  webState.focused && styles.secondaryButtonFocus,
                  webState.pressed && styles.buttonPressed,
                ];
              }}
            >
              <Text style={styles.secondaryButtonText}>Închide</Text>
            </Pressable>

            {canWithdraw ? (
              <Pressable
                accessibilityHint="Deschide confirmarea retragerii; cererea nu este retrasă încă."
                accessibilityLabel={`Retrage înscrierea la cursul ${courseTitle}`}
                accessibilityRole="button"
                onPress={onRequestWithdrawal}
                style={(state) => {
                  const webState = state as WebPressableState;

                  return [
                    styles.dangerButton,
                    pointerWebStyle,
                    webState.hovered && styles.dangerButtonHover,
                    webState.focused && styles.dangerButtonFocus,
                    webState.pressed && styles.buttonPressed,
                  ];
                }}
                testID="request-course-enrollment-withdrawal-from-status"
              >
                <Text style={styles.dangerButtonText}>
                  Retrage înscrierea
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function StatusDetail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function formatEnrollmentDate(value: string | undefined) {
  if (!value) {
    return "Se sincronizează…";
  }

  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return "Dată indisponibilă";
  }

  return new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function focusIfAvailable(value: unknown) {
  if (
    typeof value !== "object" ||
    value === null ||
    !("focus" in value) ||
    typeof value.focus !== "function"
  ) {
    return;
  }

  try {
    (value as FocusTarget).focus();
  } catch {
    // The dialog can close before the deferred focus runs.
  }
}

const styles = StyleSheet.create({
  modalRoot: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(6, 14, 34, 0.68)",
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
    alignItems: "flex-start",
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
  statusBadge: {
    backgroundColor: Colors.brandSoft,
    borderColor: "#C9D9FF",
    borderRadius: Radius.round,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  statusBadgeText: {
    color: Colors.brandDeep,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
  },
  successNotice: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
    borderRadius: Radius.lg,
    borderWidth: 1,
    color: Colors.success,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: 20,
    padding: Spacing.three,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  detailItem: {
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.borderMuted,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexBasis: 220,
    flexGrow: 1,
    gap: Spacing.xs,
    minWidth: 0,
    padding: Spacing.three,
  },
  detailLabel: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.bold,
  },
  detailValue: {
    color: Colors.text,
    flexShrink: 1,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
    lineHeight: 20,
  },
  messageBlock: {
    backgroundColor: Colors.surfaceMuted,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.md,
    padding: Spacing.three,
  },
  messageText: {
    color: Colors.textBody,
    fontSize: Typography.bodySmall,
    lineHeight: 21,
  },
  infoNotice: {
    backgroundColor: Colors.warningSurface,
    borderColor: Colors.warningBorder,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.three,
  },
  infoNoticeText: {
    color: Colors.textBody,
    fontSize: Typography.bodySmall,
    lineHeight: 20,
  },
  actions: {
    borderColor: Colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    padding: Spacing.three,
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexGrow: 1,
    justifyContent: "center",
    minHeight: 48,
    minWidth: 128,
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
  },
  dangerButton: {
    alignItems: "center",
    backgroundColor: Colors.danger,
    borderColor: Colors.danger,
    borderRadius: Radius.lg,
    borderWidth: 1,
    flexGrow: 1,
    justifyContent: "center",
    minHeight: 48,
    minWidth: 168,
    paddingHorizontal: Spacing.three,
  },
  dangerButtonHover: {
    backgroundColor: "#BE123C",
    borderColor: "#BE123C",
  },
  dangerButtonFocus: {
    borderColor: Colors.text,
  },
  dangerButtonText: {
    color: Colors.white,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.extraBold,
    textAlign: "center",
  },
  buttonPressed: {
    opacity: 0.84,
  },
});

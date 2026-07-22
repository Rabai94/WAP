import {
  useCallback,
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
  ScrollView,
  StyleSheet,
  Text,
  View,
  findNodeHandle,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Breakpoints,
  Colors,
  Layers,
  Motion,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "@/theme";
import { RabAIButton } from "./Button";
import { useReducedMotion } from "./useReducedMotion";

export type FilterSheetProps = {
  visible: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  closeLabel?: string;
  onApply?: () => void;
  applyLabel?: string;
  applying?: boolean;
  applyDisabled?: boolean;
  onClear?: () => void;
  clearLabel?: string;
  returnFocusRef?: RefObject<View | null>;
  testID?: string;
};

type FocusTarget = View | { focus?: () => void };

export default function FilterSheet({
  applyDisabled = false,
  applyLabel = "Aplică filtrele",
  applying = false,
  children,
  clearLabel = "Resetează",
  closeLabel = "Închide",
  description,
  footer,
  onApply,
  onClear,
  onClose,
  returnFocusRef,
  testID,
  title,
  visible,
}: FilterSheetProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const closeRef = useRef<View>(null);
  const automaticReturnFocusRef = useRef<FocusTarget | null>(null);
  const closeRequestedRef = useRef(false);
  const focusRestoredRef = useRef(false);
  const focusRestoreTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const wasVisibleRef = useRef(false);
  const drawer = width >= Breakpoints.tablet;
  const focusRestoreDelay = reducedMotion
    ? Motion.duration.instant
    : Motion.duration.deliberate;

  const restoreFocus = useCallback(() => {
    if (focusRestoredRef.current) {
      return;
    }

    const target = returnFocusRef?.current ?? automaticReturnFocusRef.current;

    if (!focusNode(target)) {
      return;
    }

    focusRestoredRef.current = true;
    automaticReturnFocusRef.current = null;
  }, [returnFocusRef]);

  const completeFocusRestore = useCallback(() => {
    if (focusRestoreTimeoutRef.current !== null) {
      clearTimeout(focusRestoreTimeoutRef.current);
      focusRestoreTimeoutRef.current = null;
    }

    restoreFocus();
  }, [restoreFocus]);

  const scheduleFocusRestore = useCallback(() => {
    if (focusRestoreTimeoutRef.current !== null) {
      clearTimeout(focusRestoreTimeoutRef.current);
    }

    focusRestoreTimeoutRef.current = setTimeout(() => {
      focusRestoreTimeoutRef.current = null;
      restoreFocus();
    }, focusRestoreDelay);
  }, [focusRestoreDelay, restoreFocus]);

  const requestClose = useCallback(() => {
    if (applying || closeRequestedRef.current) {
      return;
    }

    closeRequestedRef.current = true;
    onClose();
  }, [applying, onClose]);

  useEffect(() => {
    if (visible) {
      if (focusRestoreTimeoutRef.current !== null) {
        clearTimeout(focusRestoreTimeoutRef.current);
        focusRestoreTimeoutRef.current = null;
      }

      automaticReturnFocusRef.current = null;
      closeRequestedRef.current = false;
      focusRestoredRef.current = false;

      if (Platform.OS === "web") {
        automaticReturnFocusRef.current = globalThis.document
          ?.activeElement as FocusTarget | null;
      }
    } else if (wasVisibleRef.current) {
      scheduleFocusRestore();
    }

    wasVisibleRef.current = visible;
  }, [scheduleFocusRestore, visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const timeoutId = setTimeout(() => focusNode(closeRef.current), 0);
    return () => clearTimeout(timeoutId);
  }, [visible]);

  return (
    <Modal
      animationType={reducedMotion ? "none" : "fade"}
      onDismiss={completeFocusRestore}
      onRequestClose={requestClose}
      transparent
      visible={visible}
    >
      <View style={[styles.layer, drawer && styles.layerDrawer]}>
        <Pressable
          accessibilityLabel={closeLabel}
          accessibilityRole="button"
          disabled={applying}
          onPress={requestClose}
          style={styles.backdrop}
        />
        <View
          accessibilityLabel={title}
          accessibilityViewIsModal
          onAccessibilityEscape={requestClose}
          role="dialog"
          style={[
            styles.sheet,
            drawer ? styles.drawer : styles.bottomSheet,
            {
              paddingBottom: Math.max(insets.bottom, Spacing.inline),
              paddingTop: drawer
                ? Math.max(insets.top, Spacing.component)
                : Spacing.component,
            },
          ]}
          testID={testID}
        >
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text accessibilityRole="header" style={styles.title}>
                {title}
              </Text>
              {description ? (
                <Text style={styles.description}>{description}</Text>
              ) : null}
            </View>
            <RabAIButton
              ref={closeRef}
              disabled={applying}
              onPress={requestClose}
              size="sm"
              title={closeLabel}
              variant="ghost"
            />
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>

          {footer ? <View style={styles.footerContent}>{footer}</View> : null}
          {onApply || onClear ? (
            <View style={styles.actions}>
              {onClear ? (
                <RabAIButton
                  disabled={applying}
                  onPress={onClear}
                  title={clearLabel}
                  variant="ghost"
                />
              ) : null}
              {onApply ? (
                <RabAIButton
                  disabled={applyDisabled}
                  loading={applying}
                  loadingLabel={applyLabel}
                  onPress={onApply}
                  title={applyLabel}
                />
              ) : null}
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

export { FilterSheet, FilterSheet as FilterDrawer };

function focusNode(node: FocusTarget | null): boolean {
  if (!node) {
    return false;
  }

  if (Platform.OS === "web") {
    const target = node as { focus?: () => void };

    if (!target.focus) {
      return false;
    }

    target.focus();
    return true;
  }

  const handle = findNodeHandle(node as View);

  if (!handle) {
    return false;
  }

  AccessibilityInfo.setAccessibilityFocus(handle);
  return true;
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFill,
    justifyContent: "flex-end",
    zIndex: Layers.modal,
  },
  layerDrawer: {
    alignItems: "flex-end",
    justifyContent: "flex-start",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.overlay,
  },
  sheet: {
    backgroundColor: Colors.surfaceElevated,
    maxHeight: "92%",
    minHeight: 0,
    minWidth: 0,
    paddingHorizontal: Spacing.component,
    ...Shadows.floating,
  },
  bottomSheet: {
    borderColor: Colors.border,
    borderTopLeftRadius: Radius.dialog,
    borderTopRightRadius: Radius.dialog,
    borderWidth: 1,
    width: "100%",
  },
  drawer: {
    borderLeftColor: Colors.border,
    borderLeftWidth: 1,
    height: "100%",
    maxHeight: "100%",
    maxWidth: 480,
    width: "92%",
  },
  header: {
    alignItems: "flex-start",
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: Spacing.inline,
    justifyContent: "space-between",
    paddingBottom: Spacing.inline,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.pageTitle,
    fontWeight: Typography.fontWeight.semibold,
    lineHeight: Typography.lineHeight.pageTitle,
  },
  description: {
    color: Colors.textMuted,
    fontSize: Typography.supporting,
    lineHeight: Typography.lineHeight.supporting,
    marginTop: Spacing.compact,
  },
  content: {
    gap: Spacing.component,
    paddingVertical: Spacing.component,
  },
  footerContent: {
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    paddingTop: Spacing.inline,
  },
  actions: {
    alignItems: "center",
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.control,
    justifyContent: "flex-end",
    paddingTop: Spacing.inline,
  },
});

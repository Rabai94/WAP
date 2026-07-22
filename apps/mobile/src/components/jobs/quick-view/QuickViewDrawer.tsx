import {
  Colors,
  InteractionStyles,
  Layers,
  Radius,
  Shadows,
  Spacing,
} from "@/theme";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AccessibilityInfo,
  findNodeHandle,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type QuickViewDrawerProps = {
  accessibilityLabel: string;
  backdropAccessibilityLabel?: string;
  children: ReactNode;
  footer: ReactNode;
  header: ReactNode;
  onRequestClose: () => void;
  testID?: string;
  visible: boolean;
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

export default function QuickViewDrawer({
  accessibilityLabel,
  backdropAccessibilityLabel = "Închide vizualizarea rapidă",
  children,
  footer,
  header,
  onRequestClose,
  testID = "job-quick-view-drawer",
  visible,
}: QuickViewDrawerProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const drawerRef = useRef<View>(null);
  const returnFocusRef = useRef<{ focus?: () => void } | null>(null);
  const [drawerFocused, setDrawerFocused] = useState(false);
  const isPhone = width < 640;
  const isTablet = width >= 640 && width < 1120;
  const drawerWidth = isPhone
    ? width
    : isTablet
      ? Math.max(width - 24, 0)
      : Math.min(840, width * 0.9);

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (Platform.OS === "web") {
      returnFocusRef.current = globalThis.document
        ?.activeElement as { focus?: () => void } | null;
    }

    const focusTimeoutId = setTimeout(() => focusView(drawerRef.current), 0);

    return () => {
      clearTimeout(focusTimeoutId);
      if (Platform.OS === "web") {
        const target = returnFocusRef.current;
        returnFocusRef.current = null;
        setTimeout(() => target?.focus?.(), 0);
      }
    };
  }, [visible]);

  useEffect(() => {
    if (!visible || Platform.OS !== "web") {
      return;
    }

    const keyboardTarget = globalThis as unknown as GlobalKeyboardTarget;
    const handleKeyDown = (event: { key?: string }) => {
      if (event.key === "Escape") {
        onRequestClose();
      }
    };

    keyboardTarget.addEventListener?.("keydown", handleKeyDown);
    return () => {
      keyboardTarget.removeEventListener?.("keydown", handleKeyDown);
    };
  }, [onRequestClose, visible]);

  return (
    <Modal
      animationType="slide"
      onRequestClose={onRequestClose}
      presentationStyle="overFullScreen"
      transparent
      visible={visible}
    >
      <View style={styles.modalRoot}>
        <Pressable
          accessibilityLabel={backdropAccessibilityLabel}
          accessibilityRole="button"
          onPress={onRequestClose}
          style={[styles.backdrop, InteractionStyles.pointer]}
        />
        <View
          accessibilityLabel={accessibilityLabel}
          accessibilityViewIsModal
          focusable
          onAccessibilityEscape={onRequestClose}
          onBlur={(event) => {
            if (event.target === event.currentTarget) {
              setDrawerFocused(false);
            }
          }}
          onFocus={(event) => {
            if (event.target === event.currentTarget) {
              setDrawerFocused(true);
            }
          }}
          ref={drawerRef}
          role="dialog"
          style={[
            styles.drawer,
            { width: drawerWidth },
            isPhone ? styles.drawerPhone : styles.drawerRaised,
            drawerFocused && InteractionStyles.focusRing,
          ]}
          tabIndex={-1}
          testID={testID}
        >
          <View style={[styles.header, { paddingTop: insets.top }]}>
            {header}
          </View>
          <ScrollView
            contentContainerStyle={styles.bodyContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={styles.body}
          >
            {children}
          </ScrollView>
          <View
            style={[
              styles.footer,
              { paddingBottom: Math.max(insets.bottom, Spacing.three) },
            ]}
          >
            {footer}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
    zIndex: Layers.modal,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.overlay,
  },
  drawer: {
    alignSelf: "flex-end",
    backgroundColor: Colors.background,
    borderColor: Colors.border,
    borderLeftWidth: 1,
    flex: 1,
    maxHeight: "100%",
    overflow: "hidden",
  },
  drawerRaised: {
    borderBottomLeftRadius: Radius.xxl,
    borderTopLeftRadius: Radius.xxl,
    ...Shadows.elevated,
  },
  drawerPhone: {
    borderLeftWidth: 0,
  },
  header: {
    backgroundColor: Colors.textPrimary,
    flexShrink: 0,
  },
  body: {
    flex: 1,
    minHeight: 0,
  },
  bodyContent: {
    gap: Spacing.three,
    padding: Spacing.screen,
  },
  footer: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderTopWidth: 1,
    flexShrink: 0,
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.three,
  },
});

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

import { Colors, Radius, Shadows, Spacing } from "@/theme";
import type { ReactNode } from "react";
import { useEffect } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type ViewStyle,
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

const pointerWebStyle =
  Platform.OS === "web"
    ? ({ cursor: "pointer" } as unknown as ViewStyle)
    : null;

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
  const isPhone = width < 640;
  const isTablet = width >= 640 && width < 1120;
  const drawerWidth = isPhone
    ? width
    : isTablet
      ? Math.max(width - 24, 0)
      : Math.min(840, width * 0.9);

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
          style={[styles.backdrop, pointerWebStyle]}
        />
        <View
          accessibilityLabel={accessibilityLabel}
          accessibilityViewIsModal
          role="dialog"
          style={[
            styles.drawer,
            { width: drawerWidth },
            isPhone ? styles.drawerPhone : styles.drawerRaised,
          ]}
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
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(6, 14, 34, 0.54)",
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
    ...Shadows.card,
  },
  drawerPhone: {
    borderLeftWidth: 0,
  },
  header: {
    backgroundColor: "#17213F",
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

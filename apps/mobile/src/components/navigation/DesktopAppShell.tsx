import AppTopBar from "@/components/navigation/AppTopBar";
import CollapsibleSidebar from "@/components/navigation/CollapsibleSidebar";
import { useAuth } from "@/providers/AuthProvider";
import {
  Breakpoints,
  Colors,
  InteractionStyles,
  Layers,
} from "@/theme";
import { usePathname } from "expo-router";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AccessibilityInfo,
  findNodeHandle,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type ViewStyle,
} from "react-native";

type DesktopAppShellProps = {
  children: ReactNode;
  enabled: boolean;
};

export default function DesktopAppShell({
  children,
  enabled,
}: DesktopAppShellProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { height, width } = useWindowDimensions();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerFocused, setDrawerFocused] = useState(false);
  const drawerPanelRef = useRef<View>(null);
  const returnFocusRef = useRef<{ focus?: () => void } | null>(null);
  const usesDrawer = width <= Breakpoints.shell;
  const availableContentWidth = usesDrawer
    ? width
    : width - (collapsed ? 72 : 256);
  const viewportWebStyle =
    Platform.OS === "web"
      ? height > 0
        ? ({
            height,
            maxHeight: height,
            overflow: "hidden",
          } as ViewStyle)
        : ({
            height: "100vh",
            maxHeight: "100vh",
            overflow: "hidden",
          } as unknown as ViewStyle)
      : null;

  const restoreDrawerTriggerFocus = useCallback(() => {
    if (Platform.OS !== "web") {
      returnFocusRef.current = null;
      return;
    }

    const target = returnFocusRef.current;
    returnFocusRef.current = null;
    setTimeout(() => target?.focus?.(), 0);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    restoreDrawerTriggerFocus();
  }, [restoreDrawerTriggerFocus]);

  const openDrawer = useCallback(() => {
    if (Platform.OS === "web") {
      returnFocusRef.current = globalThis.document
        ?.activeElement as { focus?: () => void } | null;
    }

    setDrawerOpen(true);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(closeDrawer, 0);
    return () => clearTimeout(timeoutId);
  }, [closeDrawer, enabled, pathname, usesDrawer]);

  useEffect(() => {
    if (!drawerOpen) {
      return;
    }

    const timeoutId = setTimeout(() => focusView(drawerPanelRef.current), 0);
    return () => clearTimeout(timeoutId);
  }, [drawerOpen]);

  return (
    <View
      style={[
        styles.shell,
        enabled && styles.shellEnabled,
        enabled && viewportWebStyle,
      ]}
    >
      {enabled && !usesDrawer ? (
        <CollapsibleSidebar
          collapsed={collapsed}
          isAdmin={user?.isAdmin === true}
          onCollapseToggle={() => setCollapsed((current) => !current)}
        />
      ) : null}

      <View
        accessibilityElementsHidden={drawerOpen}
        importantForAccessibility={drawerOpen ? "no-hide-descendants" : "auto"}
        style={styles.mainColumn}
      >
        {enabled ? (
          <AppTopBar
            availableWidth={availableContentWidth}
            onMenuPress={openDrawer}
            showSearch={
              pathname !== "/engine" && !pathname.startsWith("/engine/")
            }
            showMenuButton={usesDrawer}
          />
        ) : null}

        <View
          key="route-viewport"
          style={[
            styles.routeViewport,
            enabled && styles.routeViewportEnabled,
            enabled && styles.routeViewportClipped,
            enabled && styles.routeViewportWeb,
          ]}
        >
          {children}
        </View>
      </View>

      {enabled && usesDrawer && drawerOpen ? (
        <Modal
          animationType="fade"
          onRequestClose={closeDrawer}
          transparent
          visible
        >
          <View accessibilityViewIsModal style={styles.drawerLayer}>
            <Pressable
              accessibilityLabel="Închide meniul"
              accessibilityRole="button"
              onPress={closeDrawer}
              style={styles.backdrop}
            />
            <View
              accessibilityLabel="Meniu principal"
              accessibilityViewIsModal
              focusable
              onAccessibilityEscape={closeDrawer}
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
              ref={drawerPanelRef}
              role="dialog"
              style={[
                styles.drawerPanel,
                drawerFocused && InteractionStyles.focusRing,
              ]}
              tabIndex={-1}
            >
              <CollapsibleSidebar
                collapsed={false}
                drawer
                isAdmin={user?.isAdmin === true}
                onCollapseToggle={closeDrawer}
                onNavigate={closeDrawer}
              />
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
  },
  shellEnabled: {
    backgroundColor: Colors.background,
    flexDirection: "row",
    position: "relative",
  },
  mainColumn: {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
  },
  routeViewport: {
    flex: 1,
    minHeight: 0,
    minWidth: 0,
  },
  routeViewportEnabled: {
    backgroundColor: Colors.background,
  },
  routeViewportClipped: {
    overflow: "hidden",
  },
  routeViewportWeb:
    Platform.OS === "web"
      ? ({
          overflowX: "hidden",
          overflowY: "auto",
        } as unknown as ViewStyle)
      : {},
  drawerLayer: {
    ...StyleSheet.absoluteFill,
    flexDirection: "row",
    zIndex: Layers.overlay,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.overlay,
  },
  drawerPanel: {
    height: "100%",
    zIndex: Layers.drawer,
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

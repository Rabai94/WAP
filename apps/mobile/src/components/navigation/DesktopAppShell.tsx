import AppTopBar from "@/components/navigation/AppTopBar";
import CollapsibleSidebar from "@/components/navigation/CollapsibleSidebar";
import { useAuth } from "@/providers/AuthProvider";
import { Colors } from "@/theme";
import { usePathname } from "expo-router";
import { type ReactNode, useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type ViewStyle,
} from "react-native";

const DRAWER_BREAKPOINT = 1024;

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
  const usesDrawer = width <= DRAWER_BREAKPOINT;
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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDrawerOpen(false);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [enabled, pathname, usesDrawer]);

  useEffect(() => {
    if (!drawerOpen || Platform.OS !== "web") {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDrawerOpen(false);
      }
    }

    globalThis.addEventListener("keydown", handleKeyDown);
    return () => globalThis.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen]);

  function closeDrawer() {
    setDrawerOpen(false);
  }

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
            onMenuPress={() => setDrawerOpen(true)}
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
            role="dialog"
            style={styles.drawerPanel}
          >
            <CollapsibleSidebar
              collapsed={false}
              drawer
              isAdmin={user?.isAdmin === true}
              onCollapseToggle={() => undefined}
              onNavigate={closeDrawer}
            />
          </View>
        </View>
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
    zIndex: 10000,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(8, 17, 42, 0.34)",
  },
  drawerPanel: {
    height: "100%",
    zIndex: 1,
  },
});

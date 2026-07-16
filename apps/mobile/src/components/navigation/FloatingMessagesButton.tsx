import { SymbolView } from "expo-symbols";
import { usePathname, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import { Colors, Radius, Spacing, Typography } from "@/theme";

const buttonSize = 58;
const compactButtonSize = 54;
const dragActivationThreshold = 5;
const edgeMargin = 16;
const maxBadgeLabel = "9+";
const pressSuppressMs = 140;
const storageKey = "rabai:floatingMessagesPosition";

type FloatingPosition = {
  x: number;
  y: number;
};

type WebStorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

type DragState = {
  hasDragged: boolean;
  startPointerX: number;
  startPointerY: number;
  startX: number;
  startY: number;
};

type WebPointerEventLike = {
  button?: number;
  clientX?: number;
  clientY?: number;
  nativeEvent?: {
    button?: number;
    clientX?: number;
    clientY?: number;
  };
  preventDefault?: () => void;
  stopPropagation?: () => void;
};

type WebEventTargetLike = {
  addEventListener: (
    type: string,
    listener: (event: unknown) => void
  ) => void;
  removeEventListener: (
    type: string,
    listener: (event: unknown) => void
  ) => void;
};

const fixedWebStyle =
  Platform.OS === "web"
    ? ({
        position: "fixed",
      } as unknown as ViewStyle)
    : null;

const gradientWebStyle =
  Platform.OS === "web"
    ? ({
        backdropFilter: "blur(18px)",
        backgroundImage:
          "radial-gradient(circle at 30% 22%, rgba(255,255,255,0.34) 0, rgba(255,255,255,0.10) 24%, transparent 34%), linear-gradient(135deg, #071330 0%, #145CFF 50%, #6E1DFF 100%)",
        boxShadow:
          "0 18px 38px rgba(20, 92, 255, 0.30), 0 0 0 1px rgba(255,255,255,0.28) inset",
        cursor: "pointer",
        touchAction: "none",
        transition:
          "transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease, filter 160ms ease",
        userSelect: "none",
      } as unknown as ViewStyle)
    : null;

const gradientHoverWebStyle =
  Platform.OS === "web"
    ? ({
        boxShadow:
          "0 24px 56px rgba(20, 92, 255, 0.40), 0 0 26px rgba(110,29,255,0.24), 0 0 0 1px rgba(255,255,255,0.40) inset",
      } as unknown as ViewStyle)
    : null;

const draggingWebStyle =
  Platform.OS === "web"
    ? ({
        cursor: "grabbing",
        transition: "none",
      } as unknown as ViewStyle)
    : null;

export default function FloatingMessagesButton() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  const { loading, session } = useAuth();
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const [isHovered, setIsHovered] = useState(false);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [position, setPosition] = useState<FloatingPosition | null>(() =>
    Platform.OS === "web" ? readStoredPosition() : null
  );
  // TODO: connect to Supabase realtime unread messages when messages backend is implemented.
  const unreadCount = 0;
  const isMessagesRoute = pathname === "/messages";
  const label = t("floatingMessages.label");
  const isCompact = width < 640;
  const size = isCompact ? compactButtonSize : buttonSize;
  const shouldHide = loading || !session || pathname === "/login";
  const defaultPosition = useMemo(
    () => getDefaultPosition(width, height, size),
    [height, size, width]
  );
  const resolvedPosition = clampPosition(
    position ?? defaultPosition,
    width,
    height,
    size
  );
  const isDragging = dragState?.hasDragged === true;
  const suppressPressRef = useRef(false);
  const suppressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (
      Platform.OS !== "web" ||
      !position ||
      positionsEqual(position, resolvedPosition)
    ) {
      return;
    }

    storePosition(resolvedPosition);
  }, [position, resolvedPosition]);

  useEffect(() => {
    return () => {
      if (suppressTimerRef.current) {
        clearTimeout(suppressTimerRef.current);
      }
    };
  }, []);

  const suppressNextPress = useCallback(() => {
    suppressPressRef.current = true;

    if (suppressTimerRef.current) {
      clearTimeout(suppressTimerRef.current);
    }

    suppressTimerRef.current = setTimeout(() => {
      suppressPressRef.current = false;
      suppressTimerRef.current = null;
    }, pressSuppressMs);
  }, []);

  const resetToDefaultPosition = useCallback(() => {
    if (Platform.OS !== "web") {
      return;
    }

    const nextPosition = getDefaultPosition(width, height, size);
    setPosition(nextPosition);
    storePosition(nextPosition);
    suppressNextPress();
  }, [height, size, suppressNextPress, width]);

  const handleMouseDown = useCallback(
    (event: unknown) => {
      if (Platform.OS !== "web") {
        return;
      }

      const pointer = getWebPointer(event);

      if (!pointer || getWebPointerButton(event) !== 0) {
        return;
      }

      setDragState({
        hasDragged: false,
        startPointerX: pointer.x,
        startPointerY: pointer.y,
        startX: resolvedPosition.x,
        startY: resolvedPosition.y,
      });
    },
    [resolvedPosition.x, resolvedPosition.y]
  );

  useEffect(() => {
    if (Platform.OS !== "web" || !dragState) {
      return;
    }

    const activeDragState = dragState;
    const eventTarget = getWebEventTarget();

    if (!eventTarget) {
      return;
    }

    function getNextPosition(event: unknown) {
      const pointer = getWebPointer(event);

      if (!pointer) {
        return null;
      }

      return {
        distance: getGestureDistance(
          pointer.x - activeDragState.startPointerX,
          pointer.y - activeDragState.startPointerY
        ),
        position: clampPosition(
          {
            x:
              activeDragState.startX +
              pointer.x -
              activeDragState.startPointerX,
            y:
              activeDragState.startY +
              pointer.y -
              activeDragState.startPointerY,
          },
          width,
          height,
          size
        ),
      };
    }

    function handleMouseMove(event: unknown) {
      const next = getNextPosition(event);

      if (!next) {
        return;
      }

      if (
        next.distance < dragActivationThreshold &&
        activeDragState.hasDragged === false
      ) {
        return;
      }

      preventWebDefault(event);

      if (!activeDragState.hasDragged) {
        setDragState((current) =>
          current ? { ...current, hasDragged: true } : current
        );
      }

      setPosition(next.position);
    }

    function handleMouseUp(event: unknown) {
      const next = getNextPosition(event);
      const didDrag =
        activeDragState.hasDragged ||
        (next ? next.distance >= dragActivationThreshold : false);

      if (didDrag && next) {
        preventWebDefault(event);
        setPosition(next.position);
        storePosition(next.position);
        suppressNextPress();
      }

      setDragState(null);
    }

    eventTarget.addEventListener("mousemove", handleMouseMove);
    eventTarget.addEventListener("mouseup", handleMouseUp);

    return () => {
      eventTarget.removeEventListener("mousemove", handleMouseMove);
      eventTarget.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragState, height, size, suppressNextPress, width]);

  if (shouldHide) {
    return null;
  }

  const badgeLabel = unreadCount > 9 ? maxBadgeLabel : String(unreadCount);
  const isWeb = Platform.OS === "web";
  const showTooltip = isWeb && isHovered && !isDragging;
  const tooltipVerticalStyle =
    resolvedPosition.y < size + Spacing.screen
      ? ({ top: size + Spacing.sm } satisfies ViewStyle)
      : ({ bottom: size + Spacing.sm } satisfies ViewStyle);
  const tooltipHorizontalStyle =
    resolvedPosition.x < 110
      ? ({ left: 0 } satisfies ViewStyle)
      : ({ right: 0 } satisfies ViewStyle);
  const webDoubleClickProps =
    Platform.OS === "web"
      ? ({
          onContextMenu: (event: unknown) => {
            preventWebDefault(event);
            resetToDefaultPosition();
          },
          onDoubleClick: resetToDefaultPosition,
          onMouseDown: handleMouseDown,
        } as {
          onContextMenu: (event: unknown) => void;
          onDoubleClick: () => void;
          onMouseDown: (event: unknown) => void;
        })
      : {};

  function handlePress() {
    if (suppressPressRef.current) {
      suppressPressRef.current = false;
      return;
    }

    if (isMessagesRoute) {
      return;
    }

    router.push("/messages" as never);
  }

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.container,
        fixedWebStyle,
        { height: size, width: size },
        Platform.OS === "web"
          ? { left: resolvedPosition.x, top: resolvedPosition.y }
          : {
              bottom: Math.max(
                insets.bottom + Spacing.screen,
                Spacing.screen
              ),
              right: Math.max(insets.right + Spacing.screen, Spacing.screen),
            },
      ]}
    >
      {showTooltip ? (
        <View
          pointerEvents="none"
          style={[
            styles.tooltip,
            tooltipVerticalStyle,
            tooltipHorizontalStyle,
          ]}
        >
          <Text numberOfLines={1} style={styles.tooltipText}>
            {label}
          </Text>
        </View>
      ) : null}

      <Pressable
        {...webDoubleClickProps}
        accessibilityLabel={label}
        accessibilityRole="button"
        accessibilityState={{ selected: isMessagesRoute }}
        delayLongPress={320}
        onLongPress={resetToDefaultPosition}
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        onPress={handlePress}
        style={({ pressed }) => [
          styles.button,
          gradientWebStyle,
          { height: size, width: size },
          isHovered && styles.buttonHover,
          isHovered && gradientHoverWebStyle,
          isMessagesRoute && styles.buttonCurrentRoute,
          pressed && styles.buttonPressed,
          isDragging && styles.buttonDragging,
          isDragging && draggingWebStyle,
        ]}
      >
        <View pointerEvents="none" style={styles.buttonAura} />
        <View pointerEvents="none" style={styles.buttonSheen} />
        <View pointerEvents="none" style={styles.buttonGlowDot} />
        <SymbolView
          fallback={<Text style={styles.fallbackIcon}>M</Text>}
          name={{ ios: "message.fill", android: "chat_bubble", web: "chat_bubble" }}
          size={26}
          tintColor={Colors.white}
          weight="bold"
        />

        {unreadCount > 0 ? (
          <View style={styles.badge}>
            <Text numberOfLines={1} style={styles.badgeText}>
              {badgeLabel}
            </Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

function getGestureDistance(deltaX: number, deltaY: number) {
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

function getDefaultPosition(
  viewportWidth: number,
  viewportHeight: number,
  size: number
) {
  return clampPosition(
    {
      x: viewportWidth - size - Spacing.screen,
      y: viewportHeight - size - Spacing.screen,
    },
    viewportWidth,
    viewportHeight,
    size
  );
}

function clampPosition(
  position: FloatingPosition,
  viewportWidth: number,
  viewportHeight: number,
  size: number
) {
  const safeWidth = Math.max(viewportWidth, size + edgeMargin * 2);
  const safeHeight = Math.max(viewportHeight, size + edgeMargin * 2);
  const maxX = Math.max(edgeMargin, safeWidth - size - edgeMargin);
  const maxY = Math.max(edgeMargin, safeHeight - size - edgeMargin);

  return {
    x: Math.min(Math.max(position.x, edgeMargin), maxX),
    y: Math.min(Math.max(position.y, edgeMargin), maxY),
  };
}

function getWebPointer(event: unknown) {
  const source = getWebPointerSource(event);

  if (
    typeof source.clientX === "number" &&
    Number.isFinite(source.clientX) &&
    typeof source.clientY === "number" &&
    Number.isFinite(source.clientY)
  ) {
    return {
      x: source.clientX,
      y: source.clientY,
    };
  }

  return null;
}

function getWebPointerButton(event: unknown) {
  const source = getWebPointerSource(event);

  return typeof source.button === "number" ? source.button : 0;
}

function getWebPointerSource(event: unknown) {
  const pointerEvent = event as WebPointerEventLike;

  return pointerEvent.nativeEvent ?? pointerEvent;
}

function preventWebDefault(event: unknown) {
  const pointerEvent = event as WebPointerEventLike;

  pointerEvent.preventDefault?.();
  pointerEvent.stopPropagation?.();
}

function getWebEventTarget() {
  if (Platform.OS !== "web") {
    return null;
  }

  try {
    const webGlobal = globalThis as typeof globalThis & {
      addEventListener?: WebEventTargetLike["addEventListener"];
      removeEventListener?: WebEventTargetLike["removeEventListener"];
      window?: WebEventTargetLike;
    };

    if (webGlobal.window) {
      return webGlobal.window;
    }

    if (webGlobal.addEventListener && webGlobal.removeEventListener) {
      return {
        addEventListener: webGlobal.addEventListener.bind(webGlobal),
        removeEventListener: webGlobal.removeEventListener.bind(webGlobal),
      } satisfies WebEventTargetLike;
    }
  } catch {
    return null;
  }

  return null;
}

function getWebStorage() {
  if (Platform.OS !== "web") {
    return null;
  }

  try {
    const webGlobal = globalThis as typeof globalThis & {
      localStorage?: WebStorageLike;
    };

    return webGlobal.localStorage ?? null;
  } catch {
    return null;
  }
}

function readStoredPosition() {
  const storage = getWebStorage();

  if (!storage) {
    return null;
  }

  try {
    const value = storage.getItem(storageKey);

    if (!value) {
      return null;
    }

    const parsed = JSON.parse(value) as { x?: unknown; y?: unknown };

    if (
      typeof parsed.x === "number" &&
      Number.isFinite(parsed.x) &&
      typeof parsed.y === "number" &&
      Number.isFinite(parsed.y)
    ) {
      return { x: parsed.x, y: parsed.y };
    }
  } catch {
    return null;
  }

  return null;
}

function storePosition(position: FloatingPosition) {
  const storage = getWebStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(
      storageKey,
      JSON.stringify({
        x: Math.round(position.x),
        y: Math.round(position.y),
      })
    );
  } catch {
    // localStorage may be unavailable in private or locked-down browsers.
  }
}

function positionsEqual(first: FloatingPosition, second: FloatingPosition) {
  return first.x === second.x && first.y === second.y;
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-end",
    position: "absolute",
    zIndex: 9000,
  },
  tooltip: {
    backgroundColor: "rgba(10, 16, 40, 0.94)",
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: Radius.round,
    borderWidth: 1,
    minWidth: 84,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    position: "absolute",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
  },
  tooltipText: {
    color: Colors.white,
    fontSize: Typography.small,
    fontWeight: Typography.fontWeight.extraBold,
    textAlign: "center",
  },
  button: {
    alignItems: "center",
    backgroundColor: "#10245F",
    borderColor: "rgba(255, 255, 255, 0.34)",
    borderRadius: Radius.round,
    borderWidth: 1,
    elevation: 8,
    height: buttonSize,
    justifyContent: "center",
    shadowColor: Colors.brandDeep,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    width: buttonSize,
  },
  buttonHover: {
    transform: [{ scale: 1.045 }],
  },
  buttonCurrentRoute: {
    backgroundColor: "#20145F",
    opacity: 0.9,
  },
  buttonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.96 }],
  },
  buttonDragging: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  buttonAura: {
    backgroundColor: "rgba(20, 92, 255, 0.18)",
    borderRadius: Radius.round,
    height: "126%",
    opacity: 0.9,
    position: "absolute",
    width: "126%",
  },
  buttonSheen: {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderRadius: Radius.round,
    height: "54%",
    left: 7,
    opacity: 0.72,
    position: "absolute",
    right: 7,
    top: 6,
  },
  buttonGlowDot: {
    backgroundColor: "rgba(255, 255, 255, 0.34)",
    borderRadius: Radius.round,
    height: 10,
    position: "absolute",
    right: 15,
    top: 13,
    width: 10,
  },
  fallbackIcon: {
    color: Colors.white,
    fontSize: Typography.body,
    fontWeight: Typography.fontWeight.black,
  },
  badge: {
    alignItems: "center",
    backgroundColor: Colors.danger,
    borderColor: Colors.white,
    borderRadius: Radius.round,
    borderWidth: 2,
    height: 22,
    justifyContent: "center",
    minWidth: 22,
    paddingHorizontal: Spacing.xs,
    position: "absolute",
    right: -4,
    top: -4,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: Typography.fontWeight.black,
    lineHeight: 12,
    textAlign: "center",
  },
});

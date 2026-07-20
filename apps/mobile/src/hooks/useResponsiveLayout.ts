import { useMemo } from "react";
import { Platform, useWindowDimensions } from "react-native";
import { Breakpoints, PageGutters, PageWidths } from "@/theme";

export type ResponsiveLayout = {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isLaptop: boolean;
  isDesktop: boolean;
  isWide: boolean;
  isWeb: boolean;
  contentMaxWidth: number;
  horizontalPadding: number;
  columnCount: number;
};

export function useResponsiveLayout(): ResponsiveLayout {
  const { height, width } = useWindowDimensions();

  return useMemo(() => {
    const isMobile = width < Breakpoints.mobile;
    const isTablet = width >= Breakpoints.mobile && width < Breakpoints.tablet;
    const isLaptop = width >= Breakpoints.tablet && width < Breakpoints.desktop;
    const isDesktop = width >= Breakpoints.desktop && width < Breakpoints.wide;
    const isWide = width >= Breakpoints.wide;

    return {
      width,
      height,
      isMobile,
      isTablet,
      isLaptop,
      isDesktop,
      isWide,
      isWeb: Platform.OS === "web",
      contentMaxWidth: isMobile
        ? Math.max(width, 0)
        : isTablet
          ? PageWidths.form
          : isLaptop
            ? PageWidths.content
            : isDesktop
              ? PageWidths.desktop
              : PageWidths.wide,
      horizontalPadding: isMobile
        ? PageGutters.compact
        : isTablet
          ? PageGutters.tablet
          : isLaptop
            ? PageGutters.desktop
            : isDesktop
              ? PageGutters.wide
              : PageGutters.wide,
      columnCount: isMobile ? 1 : isTablet || isLaptop ? 2 : 3,
    };
  }, [height, width]);
}

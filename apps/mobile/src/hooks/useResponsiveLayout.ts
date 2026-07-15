import { useMemo } from "react";
import { Platform, useWindowDimensions } from "react-native";

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
    const isMobile = width < 640;
    const isTablet = width >= 640 && width < 900;
    const isLaptop = width >= 900 && width < 1280;
    const isDesktop = width >= 1280 && width < 1600;
    const isWide = width >= 1600;

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
          ? 840
          : isLaptop
            ? 1120
            : isDesktop
              ? 1280
              : 1440,
      horizontalPadding: isMobile
        ? 16
        : isTablet
          ? 24
          : isLaptop
            ? 32
            : isDesktop
              ? 40
              : 48,
      columnCount: isMobile ? 1 : isTablet || isLaptop ? 2 : 3,
    };
  }, [height, width]);
}

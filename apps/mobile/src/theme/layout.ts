export const IconSize = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  hero: 48,
} as const;

export const ControlHeight = {
  compact: 36,
  small: 40,
  minimumTouch: 44,
  medium: 48,
  large: 52,
} as const;

export const Breakpoints = {
  mobile: 640,
  tablet: 900,
  shell: 1024,
  desktop: 1280,
  wide: 1600,
} as const;

export const PageWidths = {
  narrow: 640,
  form: 800,
  content: 1120,
  desktop: 1280,
  dashboard: 1400,
  wide: 1440,
} as const;

export const PageGutters = {
  compact: 16,
  tablet: 24,
  desktop: 32,
  wide: 40,
} as const;

export const Layers = {
  base: 0,
  sticky: 100,
  dropdown: 200,
  drawer: 400,
  overlay: 500,
  modal: 600,
  toast: 700,
} as const;

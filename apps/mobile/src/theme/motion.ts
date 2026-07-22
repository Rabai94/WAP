export const Motion = {
  duration: {
    instant: 0,
    fast: 120,
    normal: 180,
    slow: 240,
    deliberate: 320,
  },
} as const;

export const Opacity = {
  disabled: 0.5,
  muted: 0.7,
  pressed: 0.84,
  hover: 0.94,
  subtle: 0.12,
  overlay: 0.54,
} as const;

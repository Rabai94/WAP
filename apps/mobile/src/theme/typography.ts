const typeScale = {
  pageTitle: 32,
  sectionHeading: 22,
  body: 16,
  supporting: 14,
  caption: 13,
} as const;

const lineHeightScale = {
  pageTitle: 40,
  heading: 28,
  body: 24,
  supporting: 20,
  compact: 18,
} as const;

/**
 * Five canonical RabAI Signature typography roles.
 *
 * Compatibility aliases intentionally resolve to this same scale, including
 * the historical `small` role, so product text never falls below 13px.
 */
export const Typography = {
  fontFamily: {
    sans: undefined,
    mono: "monospace",
  },

  pageTitle: typeScale.pageTitle,
  sectionHeading: typeScale.sectionHeading,
  body: typeScale.body,
  supporting: typeScale.supporting,
  caption: typeScale.caption,

  lineHeight: {
    pageTitle: lineHeightScale.pageTitle,
    heading: lineHeightScale.heading,
    body: lineHeightScale.body,
    supporting: lineHeightScale.supporting,
    compact: lineHeightScale.compact,

    // Compatibility aliases.
    tight: lineHeightScale.compact,
    default: lineHeightScale.body,
    relaxed: lineHeightScale.heading,
    link: lineHeightScale.body,
    subtitle: lineHeightScale.heading,
    display: lineHeightScale.pageTitle,
    subtitleLarge: lineHeightScale.pageTitle,
  },

  fontWeight: {
    regular: "400",
    medium: "500",
    semibold: "600",

    // Compatibility aliases; the active system uses three weights.
    bold: "600",
    extraBold: "600",
    black: "600",
  },

  letterSpacing: {
    tight: -0.3,
    normal: 0,
    label: 0.1,
    eyebrow: 0.7,
  },

  // Compatibility aliases. New code should use the five roles above.
  h1: typeScale.pageTitle,
  h2: typeScale.pageTitle,
  h3: typeScale.sectionHeading,
  h4: typeScale.sectionHeading,
  display: typeScale.pageTitle,
  logo: typeScale.pageTitle,
  icon: typeScale.pageTitle,
  hero: typeScale.pageTitle,
  screenTitle: typeScale.pageTitle,
  title: typeScale.pageTitle,
  headline: typeScale.sectionHeading,
  cardTitleLarge: typeScale.sectionHeading,
  cardTitle: typeScale.sectionHeading,
  roleCard: typeScale.sectionHeading,
  total: typeScale.sectionHeading,
  button: typeScale.body,
  bodySmall: typeScale.supporting,
  label: typeScale.caption,
  small: typeScale.caption,
} as const;

export const palette = {
  midnight: "#101C31",
  blue: "#315DDB",
  porcelain: "#F2F5F9",
  silver: "#BBC5D2",
};
export const themes = {
  dark: {
    bg: "#0B1424",
    surface: "#142239",
    elevated: "#1B2D49",
    line: "#293B55",
    text: "#F5F7FC",
    muted: "#A5B6CE",
    accent: "#88AAFF",
    button: "#315DDB",
    positive: "#8CDDBD",
    danger: "#FFA5A5",
    soft: "#1B315A",
  },
  light: {
    bg: "#F2F5F9",
    surface: "#FFFFFF",
    elevated: "#E9EFF9",
    line: "#D9E1EE",
    text: "#101C31",
    muted: "#536580",
    accent: "#264EC2",
    button: "#315DDB",
    positive: "#146747",
    danger: "#AC2D38",
    soft: "#E6EEFF",
  },
};
export type Theme = typeof themes.dark;

// Utility functions for theme handling
export function getImageSrc(lightMode: string, darkMode: string, mode: "light" | "dark"): string {
  return mode === "dark" ? darkMode : lightMode;
}

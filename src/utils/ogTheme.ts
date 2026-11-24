// OG image colors. satori cannot read CSS variables, so these five values
// mirror the `[data-theme="dark"]` block of src/styles/site-theme.css, named
// after the variable they copy. Together with site-theme.css this is the only
// place palette hex values live. `pnpm verify` fails when they differ.
export const ogColors = {
  background: "#1e1e2e",
  accent: "#f5c2e7",
  foreground: "#cdd6f4",
  mutedForeground: "#a6adc8",
  border: "#45475a",
} as const;

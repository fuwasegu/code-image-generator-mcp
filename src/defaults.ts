export const DEFAULTS = {
  fontFamily: '"JetBrains Mono", "Fira Code", "SF Mono", "Menlo", "Consolas", "DejaVu Sans Mono", monospace',
  fontSize: 14,
  lineHeight: 1.6,
  paddingX: 32,
  paddingY: 24,
  outerPadding: 40,
  borderRadius: 12,
  windowControlsHeight: 40,
  lineNumberWidth: 48,
  theme: "github-dark" as const,
  showLineNumbers: true,
  showWindowControls: true,
  backgroundColor: "#0d1117",
  outerBackground: "#abb8c3",
  windowDotColors: {
    close: "#ff5f57",
    minimize: "#febc2e",
    maximize: "#28c840",
  },
  windowDotRadius: 6,
  windowDotSpacing: 20,
} as const;

export type ImageOptions = {
  code: string;
  language: string;
  theme?: string;
  fontFamily?: string;
  fontSize?: number;
  imageWidth?: number;
  outputPath: string;
  showLineNumbers?: boolean;
};

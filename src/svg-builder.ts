import type { ThemedToken } from "shiki";
import { DEFAULTS } from "./defaults.js";

export type SvgOptions = {
  tokens: ThemedToken[][];
  bg: string;
  fg: string;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  imageWidth?: number;
  paddingX: number;
  paddingY: number;
  outerPadding: number;
  borderRadius: number;
  showLineNumbers: boolean;
  showWindowControls: boolean;
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function expandTabs(str: string, tabSize = 4): string {
  return str.replace(/\t/g, " ".repeat(tabSize));
}

export function buildSvg(options: SvgOptions): string {
  const {
    tokens,
    bg,
    fg,
    fontFamily,
    fontSize,
    lineHeight,
    paddingX,
    paddingY,
    outerPadding,
    borderRadius,
    showLineNumbers,
    showWindowControls,
  } = options;

  const charWidth = fontSize * 0.6;
  const lineHeightPx = fontSize * lineHeight;
  const lineCount = tokens.length;

  const gutterWidth = showLineNumbers ? DEFAULTS.lineNumberWidth : 0;
  const controlsHeight = showWindowControls ? DEFAULTS.windowControlsHeight : 0;

  // Find max line length (in characters)
  let maxLineChars = 0;
  for (const line of tokens) {
    let lineChars = 0;
    for (const token of line) {
      lineChars += expandTabs(token.content).length;
    }
    maxLineChars = Math.max(maxLineChars, lineChars);
  }

  // Card inner dimensions
  const contentWidth = gutterWidth + paddingX * 2 + maxLineChars * charWidth;
  const contentHeight =
    controlsHeight + paddingY * 2 + lineCount * lineHeightPx;

  // If imageWidth is specified, use it for the card; otherwise auto-size
  const cardWidth = options.imageWidth
    ? options.imageWidth - outerPadding * 2
    : contentWidth;
  const cardHeight = contentHeight;

  const svgWidth = cardWidth + outerPadding * 2;
  const svgHeight = cardHeight + outerPadding * 2;

  const parts: string[] = [];

  // SVG header
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">`
  );

  // Style
  parts.push(`<style>
    .code-font {
      font-family: ${fontFamily};
      font-size: ${fontSize}px;
      white-space: pre;
    }
  </style>`);

  // Outer background
  parts.push(
    `<rect x="0" y="0" width="${svgWidth}" height="${svgHeight}" fill="${DEFAULTS.outerBackground}" />`
  );

  // Card background with rounded corners
  parts.push(
    `<rect x="${outerPadding}" y="${outerPadding}" width="${cardWidth}" height="${cardHeight}" rx="${borderRadius}" ry="${borderRadius}" fill="${bg}" />`
  );

  // Window controls (macOS dots)
  if (showWindowControls) {
    const dotY = outerPadding + controlsHeight / 2;
    const dotStartX = outerPadding + paddingX;
    const { windowDotColors, windowDotRadius, windowDotSpacing } = DEFAULTS;

    parts.push(
      `<circle cx="${dotStartX}" cy="${dotY}" r="${windowDotRadius}" fill="${windowDotColors.close}" />`
    );
    parts.push(
      `<circle cx="${dotStartX + windowDotSpacing}" cy="${dotY}" r="${windowDotRadius}" fill="${windowDotColors.minimize}" />`
    );
    parts.push(
      `<circle cx="${dotStartX + windowDotSpacing * 2}" cy="${dotY}" r="${windowDotRadius}" fill="${windowDotColors.maximize}" />`
    );
  }

  // Code area offset
  const codeAreaX = outerPadding + gutterWidth + paddingX;
  const codeAreaY = outerPadding + controlsHeight + paddingY;

  // Render each line
  for (let lineIdx = 0; lineIdx < lineCount; lineIdx++) {
    const y = codeAreaY + lineIdx * lineHeightPx + fontSize; // baseline offset

    // Line numbers
    if (showLineNumbers) {
      const lineNumX = outerPadding + DEFAULTS.lineNumberWidth - 8;
      parts.push(
        `<text x="${lineNumX}" y="${y}" class="code-font" fill="${fg}" opacity="0.3" text-anchor="end">${lineIdx + 1}</text>`
      );
    }

    // Tokens
    let x = codeAreaX;
    for (const token of tokens[lineIdx]) {
      const content = expandTabs(token.content);
      if (content.length === 0) continue;

      const color = token.color || fg;
      const tokenWidth = content.length * charWidth;
      parts.push(
        `<text x="${x}" y="${y}" class="code-font" fill="${color}" xml:space="preserve" textLength="${tokenWidth}" lengthAdjust="spacing">${escapeXml(content)}</text>`
      );
      x += content.length * charWidth;
    }
  }

  parts.push("</svg>");
  return parts.join("\n");
}

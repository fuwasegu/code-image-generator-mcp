import sharp from "sharp";
import { codeToTokens } from "shiki";
import { DEFAULTS, type ImageOptions } from "./defaults.js";
import { buildSvg } from "./svg-builder.js";

export async function generateCodeImage(options: ImageOptions): Promise<{
	width: number;
	height: number;
	outputPath: string;
	base64: string;
}> {
	const {
		code,
		language,
		theme = DEFAULTS.theme,
		fontFamily = DEFAULTS.fontFamily,
		fontSize = DEFAULTS.fontSize,
		imageWidth,
		outputPath,
		showLineNumbers = DEFAULTS.showLineNumbers,
	} = options;

	// Tokenize with Shiki
	const { tokens, bg, fg } = await codeToTokens(code, {
		lang: language as any,
		theme: theme as any,
	});

	// Build SVG
	const svg = buildSvg({
		tokens,
		bg: bg || DEFAULTS.backgroundColor,
		fg: fg || "#e6edf3",
		fontFamily,
		fontSize,
		lineHeight: DEFAULTS.lineHeight,
		imageWidth,
		paddingX: DEFAULTS.paddingX,
		paddingY: DEFAULTS.paddingY,
		outerPadding: DEFAULTS.outerPadding,
		borderRadius: DEFAULTS.borderRadius,
		showLineNumbers,
		showWindowControls: DEFAULTS.showWindowControls,
	});

	// Convert SVG to PNG via Sharp
	const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

	// Write to file
	await sharp(pngBuffer).toFile(outputPath);

	// Get dimensions
	const metadata = await sharp(pngBuffer).metadata();

	// Base64 for inline response
	const base64 = pngBuffer.toString("base64");

	return {
		width: metadata.width || 0,
		height: metadata.height || 0,
		outputPath,
		base64,
	};
}

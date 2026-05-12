#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { generateCodeImage } from "./generate-image.js";

const server = new McpServer({
	name: "code-image-generator",
	version: "1.0.0",
});

server.tool(
	"generate_code_image",
	"Generates a beautiful PNG image of source code with syntax highlighting, similar to Carbon (carbon.now.sh). Returns the image as base64 and saves it to the specified path.",
	{
		code: z.string().describe("The source code text to render"),
		language: z
			.string()
			.describe(
				'Language identifier for syntax highlighting (e.g., "typescript", "python", "rust")',
			),
		theme: z
			.string()
			.optional()
			.describe(
				'Shiki theme name (default: "github-dark"). Examples: "github-light", "dracula", "one-dark-pro", "nord"',
			),
		fontFamily: z
			.string()
			.optional()
			.describe(
				"Font family for rendering (default: JetBrains Mono with fallbacks)",
			),
		fontSize: z
			.number()
			.optional()
			.describe("Font size in pixels (default: 14)"),
		imageWidth: z
			.number()
			.optional()
			.describe(
				"Image width in pixels. Auto-calculated from content if omitted",
			),
		outputPath: z
			.string()
			.describe("Absolute file path where the PNG image will be saved"),
		showLineNumbers: z
			.boolean()
			.optional()
			.describe("Whether to show line numbers (default: true)"),
	},
	async (params) => {
		try {
			const result = await generateCodeImage(params);

			return {
				content: [
					{
						type: "text",
						text: `Code image saved to ${result.outputPath} (${result.width}x${result.height}px)`,
					},
					{
						type: "image",
						data: result.base64,
						mimeType: "image/png",
					},
				],
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			return {
				content: [{ type: "text", text: `Error generating image: ${message}` }],
				isError: true,
			};
		}
	},
);

async function main() {
	const transport = new StdioServerTransport();
	await server.connect(transport);
}

main().catch((error) => {
	console.error("Fatal error:", error);
	process.exit(1);
});

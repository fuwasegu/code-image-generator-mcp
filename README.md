# @fuwasegu/code-image-generator-mcp

An MCP server that generates beautiful source code images with syntax highlighting, similar to [Carbon](https://carbon.now.sh/). Designed to be used by AI agents (e.g., slide generation agents) via the Model Context Protocol.

## Features

- VS Code-quality syntax highlighting powered by [Shiki](https://shiki.style/)
- Carbon-like appearance: rounded card, macOS window dots, line numbers
- 40+ themes (`github-dark`, `dracula`, `one-dark-pro`, `nord`, `github-light`, etc.)
- 200+ languages supported
- No browser dependency — fast SVG-based rendering with [Sharp](https://sharp.pixelplumbing.com/)
- Returns both a saved PNG file and inline base64 image

## Setup

### Claude Code

```bash
claude mcp add code-image-generator -- npx @fuwasegu/code-image-generator-mcp
```

### Claude Desktop / MCP Client

Add to your config (e.g., `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "code-image-generator": {
      "command": "npx",
      "args": ["@fuwasegu/code-image-generator-mcp"]
    }
  }
}
```

## Tool: `generate_code_image`

Generates a PNG image of source code and saves it to the specified path.

### Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `code` | string | Yes | — | Source code to render |
| `language` | string | Yes | — | Language for highlighting (e.g., `"typescript"`, `"python"`, `"rust"`) |
| `outputPath` | string | Yes | — | Absolute file path for the output PNG |
| `theme` | string | No | `"github-dark"` | Shiki theme name |
| `fontFamily` | string | No | `"JetBrains Mono"` + fallbacks | Font family for rendering |
| `fontSize` | number | No | `14` | Font size in pixels |
| `imageWidth` | number | No | auto | Image width in pixels (auto-calculated from content if omitted) |
| `showLineNumbers` | boolean | No | `true` | Whether to show line numbers |

### Response

Returns two content blocks:

1. **Text** — Summary with file path and dimensions (e.g., `Code image saved to /tmp/out.png (800x400px)`)
2. **Image** — Base64-encoded PNG for inline preview

## Architecture

```
Shiki (tokenize) → SVG (build layout) → Sharp (render PNG)
```

- **Shiki** — Tokenizes source code using TextMate grammars (same as VS Code)
- **SVG Builder** — Constructs an SVG string with Carbon-like layout: outer background, rounded card, window controls, line numbers, and colored code tokens
- **Sharp** — Converts SVG to PNG via librsvg (no headless browser needed)

## Project Structure

```
src/
  index.ts              # MCP server entry point (stdio transport)
  generate-image.ts     # Pipeline: Shiki → SVG → Sharp
  svg-builder.ts        # SVG string construction
  defaults.ts           # Default styling values
```

## Font Notes

The rendered image uses system fonts. For best results, install a monospace font like [JetBrains Mono](https://www.jetbrains.com/lp/mono/) or Fira Code. The default fallback chain is:

```
JetBrains Mono → Fira Code → SF Mono → Menlo → Consolas → DejaVu Sans Mono → monospace
```

## License

MIT

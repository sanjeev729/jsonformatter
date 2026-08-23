# jsonformatterai.com — Privacy-First JSON Formatter & Developer Toolset

> **100% In-Browser Processing. Zero Data Transfers. Local Secure Sandbox.**  
> Website: [https://jsonformatterai.com](https://jsonformatterai.com)

**jsonformatterai.com** is a high-performance, privacy-first web application built with **Astro** and **Tailwind CSS**. Designed for developers, security engineers, and data teams who need to format, validate, diff-compare, convert, and encode JSON payloads without sending sensitive data over the network.

---

## ⚡ Features

- 🛠️ **JSON Formatter & Linter**: Real-time syntax validation, customizable indentation (2, 3, 4 spaces, Tab), error diagnostics with jump-to-line, raw formatted view, interactive tree view, and minification.
- 🔀 **Diff Compare Engine**: Advanced LCS line/word diffing with **Split View**, **Unified View**, and **Tree Diff** modes. Includes key-filtering (e.g. ignore timestamps/UUIDs) and step-by-step diff navigation (`Prev` / `Next`).
- 🔄 **Multi-Format Converters**: Bi-directional conversions between **JSON ⇄ YAML**, **JSON ⇄ XML**, and **JSON ⇄ CSV**.
- 🔐 **Encoder & Decoder Toolset**: Instant **Base64** and **URL** encoding/decoding.
- 📐 **Space-Optimized IDE Canvas**: Dynamic full-viewport adaptive height, expanded 1750px widescreen layout, and collapsible sidebar toggle.
- 🔒 **100% Client-Side Privacy**: All processing runs locally inside your browser sandbox — no server calls, zero tracking.

---

## 📂 Project Structure

```text
jsonformatterai.com/
├── public/
│   ├── favicon.ico
│   ├── favicon.svg
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── components/
│   │   ├── Footer.astro         # Compact responsive footer with privacy links
│   │   ├── Header.astro         # Sticky header with logo & theme toggle
│   │   └── JsonWorkspace.astro  # Core interactive workspace & tool panels
│   ├── layouts/
│   │   └── Layout.astro         # HTML head metadata, fonts & theme inline script
│   ├── pages/
│   │   └── index.astro          # Main entry page with compact hero header
│   ├── styles/
│   │   └── global.css           # Tailwind v4 configuration & theme custom tokens
│   └── utils/
│       ├── DiffEngine.js        # LCS diff comparison & tree diff algorithms
│       ├── TreeViewer.js        # Interactive collapsible JSON tree renderer
│       └── XmlConverter.js      # Custom XML to/from JSON conversion logic
├── astro.config.mjs
├── package.json
└── README.md
```

---

## 🧞 Commands

All commands are run from the root of the project:

| Command | Action |
| :--- | :--- |
| `npm install` | Installs project dependencies |
| `npm run dev` | Starts local dev server (default port `4321` or `4322`) |
| `npm run build` | Builds production-optimized bundle to `./dist/` |
| `npm run preview` | Previews production build locally |
| `npm run astro ...` | Executes Astro CLI helper commands |

---

## 🎨 Tech Stack

- **Framework**: [Astro](https://astro.build/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Parser**: `js-yaml` for YAML handling
- **Icons & Typography**: Inter & JetBrains Mono (Google Fonts)

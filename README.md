# jsonformatterai.com — Privacy-First JSON Formatter & Developer Toolset

[![Astro](https://img.shields.io/badge/Astro-v6.4-ff5d01?logo=astro&logoColor=white)](https://astro.build/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.3-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Privacy](https://img.shields.io/badge/Privacy-100%25_In--Browser-00dfd8)](https://jsonformatterai.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **100% Client-Side In-Browser Processing. Zero Data Transfers. Local Secure Sandbox.**  
> **Official Website:** [https://jsonformatterai.com](https://jsonformatterai.com)

---

## 📌 Overview

**jsonformatterai.com** is a high-performance, privacy-first web application designed for software engineers, security professionals, DevOps teams, and data analysts. It provides an all-in-one developer workspace to format, validate, diff-compare, convert, and encode JSON payloads securely inside the browser without transmitting sensitive data over external networks.

Built with **Astro 6** and **Tailwind CSS v4**, the user interface follows a modern, Vercel/Geist-inspired minimalist aesthetic, featuring clean geometric typography, high-contrast dark/light modes, ambient mesh gradients, and a responsive widescreen IDE layout.

---

## ⚡ Core Features

### 🛠️ 1. JSON Formatter & Validator (Linter)
* **Real-Time Syntax Validation**: Strict RFC 8259 compliance checking with instant line-number error location.
* **Auto-Repair Heuristics**: One-click smart repair for common syntax errors, such as fixing single quotes, removing trailing commas, and adding missing key quotes.
* **Custom Indentation**: Toggle between 2 spaces, 3 spaces, 4 spaces, or Tab indentations.
* **Dual Output Mode**: Seamlessly switch between **Raw Formatted JSON** view and an interactive **Collapsible Tree View**.
* **Payload Diagnostics**: Real-time stats counting total lines, byte size, key count, and tree depth.
* **File Upload & Presets**: Drag-and-drop `.json` or `.txt` files directly into the editor, or load sample JSON payloads (Simple Object, Nested Array, Config File).
* **Quick Tools**: Instant minification, single-click clipboard copying, and file downloading.

### 🔀 2. Diff Compare Engine
* **LCS Delta Algorithm**: Advanced Longest Common Subsequence diff comparison engine for JSON payloads and raw text.
* **Flexible View Modes**:
  * **Split View**: Side-by-side comparative inspection with synchronized scrolling.
  * **Unified View**: Consolidated inline diff highlighting added (+), deleted (-), and modified lines.
  * **Tree Diff View**: Structural comparison flagging changed keys and nested object mutations.
* **Key-Filter Masking**: Ignore dynamic parameters (e.g., timestamps, UUIDs, volatile metadata) during diff checks.
* **Diff Navigation**: Quick step-by-step jump controls (`Prev` / `Next` diff markers).

### 🔄 3. Multi-Format Converters
* **JSON ⇄ YAML**: Bi-directional transformation powered by `js-yaml`.
* **JSON ⇄ XML**: Custom dual-engine XML parser supporting tag attributes, nested structures, and array normalization.
* **JSON ⇄ CSV**: Automatic flattening of complex JSON objects and arrays into tabular CSV format for spreadsheet export.

### 🔐 4. Encoder & Decoder Toolset
* **Base64 Tool**: Instant UTF-8 safe Base64 encoding and decoding.
* **URL Encoder**: Percent-encoding and decoding for API parameter strings and web URLs.

### 🎨 5. Widescreen & Responsive UX Canvas
* **Adaptive Height Layout**: Dynamic viewport height scaling with widescreen expansion up to 1750px.
* **Collapsible Sidebar**: One-click toggle (`Hide Sidebar` / `Show Sidebar`) to maximize workspace real estate.
* **Dark / Light Theme Engine**: High-contrast theme switcher with local storage persistence and zero visual flicker (FOUC).

### 🔒 6. Zero-Trust Privacy Guarantee
* **100% Client-Side Execution**: All parsing, diffing, conversion, and encoding execute strictly within your local browser sandbox.
* **Zero Network Requests**: Your payloads never leave your computer. No data is sent to external APIs or logging servers.

---

## 🎨 Tech Stack

* **Web Framework**: [Astro v6.4+](https://astro.build/)
* **Styling & Design System**: [Tailwind CSS v4.3+](https://tailwindcss.com/) with Vercel/Geist design tokens
* **Core Languages**: HTML5, Modern JavaScript (ES2024), CSS3
* **Parsers & Utilities**:
  * `js-yaml` (^4.2.0) — YAML parsing and stringifying
  * `@astrojs/sitemap` (^3.7.3) — XML Sitemap generation
* **Typography**: Inter (Geometric Sans) & JetBrains Mono (Technical Monospace) via Google Fonts

---

## 📂 Project Structure

```text
jsonformatterai.com/
├── public/
│   ├── favicon.ico              # Web favicon icon
│   ├── favicon.svg              # Scalable SVG favicon
│   ├── robots.txt               # Search engine crawler instructions
│   └── sitemap.xml              # Generated sitemap
├── src/
│   ├── components/
│   │   ├── FaqSection.astro     # SEO-optimized FAQ accordion component
│   │   ├── Footer.astro         # Footer with links, copyright & privacy status
│   │   ├── Header.astro         # Sticky navigation header with logo & theme toggle
│   │   ├── JsonWorkspace.astro  # Main workspace console (Formatter, Diff, Converter, Encoder)
│   │   ├── SeoContent.astro     # Comprehensive SEO documentation section
│   │   └── Welcome.astro        # Hero branding component
│   ├── layouts/
│   │   └── Layout.astro         # Core HTML layout, meta tags, fonts & inline theme script
│   ├── pages/
│   │   ├── 404.astro            # Custom 404 Page Not Found error page
│   │   ├── 500.astro            # Custom 500 Internal Server Error page
│   │   ├── about-us.astro       # About Us page
│   │   ├── contact-us.astro     # Contact Us page
│   │   ├── index.astro          # Homepage entry with hero & workspace console
│   │   ├── privacy-policy.astro # Privacy Policy statutory page
│   │   └── terms-and-conditions.astro # Terms & Conditions page
│   ├── styles/
│   │   └── global.css           # Tailwind CSS v4 design tokens, utilities & themes
│   └── utils/
│       ├── DiffEngine.js        # LCS diff comparison & tree diff logic
│       ├── TreeViewer.js        # Interactive collapsible JSON tree view renderer
│       └── XmlConverter.js      # Bi-directional XML ⇄ JSON conversion algorithm
├── astro.config.mjs             # Astro project configuration
├── package.json                 # Project dependencies and script commands
└── README.md                    # Project documentation
```

---

## 🧞 Getting Started

### Prerequisites

Ensure you have **Node.js** version `22.12.0` or higher installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sanjeev729/jsonformatter.git
   cd jsonformatterai.com
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:4321` to view the app locally.

---

## 📜 Available NPM Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Astro local development server |
| `npm run build` | Compiles and builds the production static bundle in `./dist/` |
| `npm run preview` | Runs a local web server to preview the production build |
| `npm run deploy` | Builds the project and deploys to **Cloudflare Pages** via Wrangler |
| `npm run astro ...` | Runs Astro CLI commands |

---

## 🚀 Deployment

The site is built as a zero-dependency static application and is optimized for deployment on **Cloudflare Pages**, **Vercel**, or **Netlify**.

To deploy to Cloudflare Pages:
```bash
npm run deploy
```

---

## 🔒 Privacy & Security

**jsonformatterai.com** is built with a strict **Zero-Trust Privacy Architecture**. We believe developer tools should never compromise data security. 

* All operations (formatting, diffing, converting, encoding) execute entirely in client-side Web APIs.
* No payload data is stored, cached, or transmitted to any server or third party.
* Safe for handling confidential API payloads, proprietary configuration files, and private user keys.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).


# Obsidian UI Studio - Architecture

Obsidian UI Studio is a modular front-end component builder for Obsidian, designed to create, compile, and embed custom HTML/CSS/JS components into Canvas. Its architecture separates the plugin logic, runtime environment, and documentation for maintainability and scalability.

---

## Folder Structure

obsidian-ui-studio/
├─ src/ # TypeScript plugin source code
│ ├─ main.ts # Plugin entry point
│ ├─ ComponentStudioView.ts # Main panel for the component studio
│ ├─ EditorPane.ts # Multi-tab code editor (HTML/CSS/JS)
│ ├─ Toolbar.ts # Build and Embed buttons
│ ├─ ComponentCompiler.ts # Compiles Pug/SCSS/Stylus/JS into HTML/CSS/JS
│ └─ CanvasEmbedder.ts # Embeds compiled components into Canvas
├─ studio-runtime/ # Runtime and build environment
│ ├─ index.pug # Base HTML template
│ ├─ main.scss # Global styles
│ ├─ main.js # JavaScript runtime
│ └─ vite.config.js # Vite build configuration
├─ docs/ # Project documentation
├─ manifest.json # Obsidian plugin manifest
├─ package.json # Node/Vite dependencies and scripts
├─ tsconfig.json # TypeScript configuration
├─ styles.css # Compiled CSS
└─ .gitignore


---

## Core Components

### **main.ts**
- Registers the plugin with Obsidian.
- Initializes and registers the `ComponentStudioView` panel.
- Handles lifecycle events (`onload`, `onunload`).

### **ComponentStudioView**
- The main panel inside Obsidian.
- Hosts the EditorPane and Toolbar.
- Manages layout, tab interactions, and user events.

### **EditorPane**
- Multi-tab code editor for HTML, CSS (SCSS/Stylus), and JS.
- Integrates **Monaco Editor** for syntax highlighting and advanced features.
- Methods: `getCode()`, `setCode()`, `onChange(callback)`.

### **Toolbar**
- Provides Build and Embed buttons for user interaction.
- Uses Obsidian `Notice` system for feedback.
- Designed to be extensible with additional buttons.

### **ComponentCompiler**
- Handles compiling Pug → HTML, SCSS/Stylus → CSS, Babel → JS.
- Outputs compiled files to `studio-runtime/dist/` or directly to the vault plugin folder.

### **CanvasEmbedder**
- Injects compiled components into Obsidian Canvas as independent nodes.
- Ensures multiple instances can coexist without conflicts.

---

## Build Environment

- Uses **Vite** for fast development and live preview.
- Supports SCSS, Stylus, Pug preprocessing.
- Provides hot reload for real-time component testing.
- Separation of `studio-runtime/` keeps runtime and development files organized.

---

## Design Principles

1. **Modular** – Each class has a single responsibility.
2. **Extensible** – Easy to add new preprocessors, templates, or editor features.
3. **Maintainable** – Clear separation between source (`src/`) and runtime (`studio-runtime/`).
4. **Portfolio-ready** – Documentation and structure emphasize professional best practices.

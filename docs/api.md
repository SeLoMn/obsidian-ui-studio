# Obsidian UI Studio - API Reference

This document describes the primary classes, methods, and utilities available in Obsidian UI Studio for developers and contributors.

---

## **EditorPane**

Handles the code editing interface for HTML, CSS, and JS.

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `getCode()` | Returns the current code from all editor tabs | None | `{ html: string, css: string, js: string }` |
| `setCode({html, css, js})` | Populates editor with provided code | Object with `html`, `css`, `js` strings | void |
| `onChange(callback)` | Registers a callback triggered on code changes | `callback(codeObj)` | void |

---

## **Toolbar**

Controls the Build and Embed actions for the plugin.

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `addButton(label, callback)` | Adds a button to the toolbar | `label: string`, `callback: function` | void |
| `notify(message)` | Shows a notice in Obsidian | `message: string` | void |

---

## **ComponentCompiler**

Responsible for compiling user-written components into runtime-ready output.

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `compile(component)` | Compiles Pug/SCSS/Stylus/JS into a bundled output | `component: { html, css, js }` | `Promise<string>` → output file path |
| `setOutputDir(dir)` | Sets the output directory for compiled files | `dir: string` | void |

---

## **CanvasEmbedder**

Handles embedding compiled components into Obsidian Canvas.

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `renderEmbedButton(filepath)` | Adds a button to embed the component | `filepath: string` | void |
| `embedComponent(filepath, options)` | Injects the compiled component into Canvas | `filepath: string`, `options?: object` | void |

---

## **Utilities**

- `sanitizeHTML(html: string)` → Cleans HTML before embedding.
- `compileSCSS(scss: string)` → Returns compiled CSS.
- `compileStylus(styl: string)` → Returns compiled CSS.
- `compilePug(pug: string)` → Returns HTML.
- `transpileJS(js: string)` → Returns browser-compatible JS via Babel.

---

### Notes

- Classes are **modular and independent**, so developers can import and extend only the parts they need.
- The `studio-runtime/` folder contains runtime helpers and build scripts and is **not meant for direct import**.
- All methods include inline **JSDoc comments** for detailed developer guidance.

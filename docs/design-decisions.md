# Obsidian UI Studio - Design Decisions

This document explains the reasoning behind major architectural, UI, and technical decisions made during the development of Obsidian UI Studio. It is intended to provide context for contributors, maintainers, and portfolio reviewers.

---

## 1. Editor Choice

- **Monaco Editor** was chosen for its multi-language support, syntax highlighting, and editor features (autocomplete, theming, multiple cursors).  
- **Ace Editor** was considered but lacked integrated themes and advanced features needed for HTML/SCSS/JS/Pug workflow.  
- A tabbed editor approach was implemented to separate HTML, CSS (SCSS/Stylus), and JS for clarity and modularity.

---

## 2. Build Pipeline

- **Vite** was selected for fast compilation, hot module replacement, and seamless preprocessing of SCSS, Stylus, and Pug.  
- **Babel** is used to transpile modern JavaScript/TypeScript for browser compatibility.  
- Separation of `studio-runtime/` ensures runtime files don’t pollute the plugin source and allows live previews during development.

---

## 3. Canvas Embedding

- Components are injected as **Canvas nodes** instead of simple file references for better performance and interactivity.  
- Each component instance is independent, allowing multiple copies in Canvas without collisions.  
- Embedding logic is isolated in `CanvasEmbedder.ts` to maintain a clear separation of concerns.

---

## 4. Templates & Extensibility

- A `templates/` folder allows users to start with pre-defined component structures, improving usability.  
- Modular design ensures new preprocessors, editor features, or templates can be added without refactoring core classes.

---

## 5. TypeScript & Modular Architecture

- The plugin is written in **TypeScript** for type safety and maintainability.  
- Each core responsibility (Editor, Toolbar, Compiler, Canvas Embedder) is isolated in its own class.  
- This modular structure allows contributors to understand, extend, or replace parts of the system without affecting unrelated functionality.

---

## 6. Documentation-First Approach

- A `/docs` folder is included to ensure **design decisions, architecture, API, dev-log, and changelog** are recorded from day one.  
- This approach ensures clarity for future maintainers and strengthens the portfolio presentation.

---

## 7. Development & Portfolio Goals

- Every feature and commit is documented in **dev-log.md**, with rationale in **design-decisions.md**, making the repository not only functional but **portfolio-ready**.  
- The design emphasizes **clarity, maintainability, and professional presentation**, demonstrating best practices in plugin development.

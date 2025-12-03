# Obsidian UI Studio - Changelog

All notable changes to Obsidian UI Studio will be documented in this file.  
This project uses **semantic versioning**: `MAJOR.MINOR.PATCH`  

- **MAJOR**: breaking changes or incompatible API changes  
- **MINOR**: new features, functionality added in a backward-compatible manner  
- **PATCH**: bug fixes, minor improvements

---

## [0.1.0] - 2025-11-29
### Added
- Initial project setup: GitHub repo, folder structure, `.gitignore`, LICENSE, package.json, tsconfig.json  
- Placeholder `/docs` files: `design-decisions.md`, `architecture.md`, `api.md`, `dev-log.md`, `changelog.md`  
- README with project description and WIP note  

---

## [0.2.0] - 2025-11-30
### Added
- Plugin manifest (`manifest.json`) with metadata  
- `main.ts` skeleton for Obsidian plugin  
- Registered `ComponentStudioView` panel placeholder  

---

## [0.3.0] - 2025-12-01
### Added
- Implemented `ComponentStudioView` panel structure  
- Placeholder container for EditorPane and Toolbar  
- Architecture documentation updated  

---

## [0.4.0] - 2025-12-02
### Added
- Monaco editor integration for HTML/CSS/JS tabs  
- `EditorPane.ts` class with `getCode()` and `setCode()`  
- Syntax highlighting for SCSS, Stylus, Pug  

---

## [0.5.0] - 2025-12-03
### Added
- Toolbar with Build and Embed buttons  
- Obsidian Notice feedback system implemented  

---

## [0.6.0] - 2025-12-04
### Added
- `ComponentCompiler.ts` for Pug → HTML, SCSS/Stylus → CSS, Babel → JS  
- Output to `studio-runtime/dist/` for runtime embedding  

---

## [0.7.0] - 2025-12-05
### Added
- `CanvasEmbedder.ts` for inserting compiled components into Canvas  
- Embed button fully functional  

---

## [0.8.0] - 2025-12-06
### Added
- Starter component templates in `templates/` folder  
- Template selection implemented in EditorPane  

---

## [0.9.0] - 2025-12-07
### Added
- Vite dev server configured for live preview  
- SCSS, Stylus, Pug preprocessing with hot reload  

---

## [1.0.0] - 2025-12-08
### Added
- Final polish, screenshots/GIFs for README  
- Minor bug fixes and editor tab improvements  
- Documentation fully updated: `/docs` folder  
- Plugin now portfolio-ready and ready for first release

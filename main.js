'use strict';

var obsidian = require('obsidian');

const VIEW_TYPE_STUDIO = 'component-studio-view';
class ComponentStudioView extends obsidian.ItemView {
    constructor(leaf, plugin) {
        super(leaf);
        this.plugin = plugin;
    }
    getViewType() {
        return VIEW_TYPE_STUDIO;
    }
    getDisplayText() {
        return 'Component Studio';
    }
    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        container.addClass('obsidian-ui-studio-container');
        const editorArea = container.createDiv({ cls: 'studio-editor-area' });
        const previewArea = container.createDiv({ cls: 'studio-preview-area' });
        const tabHeader = editorArea.createDiv({ cls: 'studio-tab-header' });
        const tabContent = editorArea.createDiv({ cls: 'studio-tab-content' });
        const htmlTabButton = tabHeader.createEl('button', { text: 'HTML', cls: 'studio-tab-button active' });
        const htmlTabPanel = tabContent.createDiv({ cls: 'studio-tab-panel active', attr: { 'data-tab': 'html' } });
        const htmlTextarea = htmlTabPanel.createEl('textarea', { cls: 'studio-editor html-input' });
        const cssTabButton = tabHeader.createEl('button', { text: 'CSS', cls: 'studio-tab-button' });
        const cssTabPanel = tabContent.createDiv({ cls: 'studio-tab-panel', attr: { 'data-tab': 'css' } });
        const cssTextarea = cssTabPanel.createEl('textarea', { cls: 'studio-editor css-input' });
        const jsTabButton = tabHeader.createEl('button', { text: 'JS', cls: 'studio-tab-button' });
        const jsTabPanel = tabContent.createDiv({ cls: 'studio-tab-panel', attr: { 'data-tab': 'js' } });
        const jsTextarea = jsTabPanel.createEl('textarea', { cls: 'studio-editor js-input' });
        const controls = previewArea.createDiv({ cls: 'studio-preview-controls' });
        controls.createEl('h4', { text: 'Component Name:' });
        const nameInput = controls.createEl('input', { cls: 'studio-name-input', type: 'text', placeholder: 'My Awesome Component' });
        const actions = controls.createDiv({ cls: 'studio-actions' });
        const saveButton = actions.createEl('button', { text: '💾 Save', cls: 'studio-save-button' });
        const renderButton = actions.createEl('button', { text: '⟳ Render', cls: 'studio-reload-button' });
        const previewWrapper = previewArea.createDiv({ cls: 'studio-preview-output-wrapper' });
        this.previewIframe = previewWrapper.createEl('iframe', { cls: 'studio-preview-iframe' });
        const switchTab = (tabName) => {
            document.querySelectorAll('.studio-tab-button').forEach(btn => btn.removeClass('active'));
            document.querySelectorAll('.studio-tab-panel').forEach(panel => panel.removeClass('active'));
            document.querySelector(`.studio-tab-button:nth-child(${tabName === 'html' ? 1 : tabName === 'css' ? 2 : 3})`)?.addClass('active');
            document.querySelector(`.studio-tab-panel[data-tab="${tabName}"]`)?.addClass('active');
            if (tabName === 'html') {
                this.htmlEditor.refresh();
                this.htmlEditor.focus();
            }
            if (tabName === 'css') {
                this.cssEditor.refresh();
                this.cssEditor.focus();
            }
            if (tabName === 'js') {
                this.jsEditor.refresh();
                this.jsEditor.focus();
            }
        };
        htmlTabButton.onclick = () => switchTab('html');
        cssTabButton.onclick = () => switchTab('css');
        jsTabButton.onclick = () => switchTab('js');
        this.htmlEditor = window.CodeMirror.fromTextArea(htmlTextarea, { mode: "htmlmixed", lineNumbers: true, theme: "obsidian" });
        this.cssEditor = window.CodeMirror.fromTextArea(cssTextarea, { mode: "css", lineNumbers: true, theme: "obsidian" });
        this.jsEditor = window.CodeMirror.fromTextArea(jsTextarea, { mode: "javascript", lineNumbers: true, theme: "obsidian" });
        const saveAndRenderComponent = async () => {
            const componentName = nameInput.value || 'untitled-component';
            const html = this.htmlEditor.getValue();
            const css = this.cssEditor.getValue();
            const js = this.jsEditor.getValue();
            const componentData = {
                name: componentName,
                html: html,
                css: css,
                js: js,
                timestamp: new Date().toISOString()
            };
            const componentDir = `${this.plugin.app.vault.configDir}/plugins/obsidian-ui-studio/components`;
            await this.plugin.app.vault.adapter.mkdir(componentDir);
            const filename = `${componentDir}/${componentName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`;
            await this.plugin.app.vault.adapter.write(filename, JSON.stringify(componentData, null, 2));
            const iframeContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>${css}</style>
                </head>
                <body>
                    ${html}
                    <script type="text/javascript">
                        window.onload = function() {
                            ${js}
                        };
                    </script>
                </body>
                </html>
            `;
            if (this.previewIframe.contentWindow) {
                const doc = this.previewIframe.contentWindow.document;
                doc.open();
                doc.write(iframeContent);
                doc.close();
            }
            new obsidian.Notice(`Component "${componentName}" saved and rendered!`);
        };
        renderButton.onclick = saveAndRenderComponent;
        saveButton.onclick = saveAndRenderComponent;
        const activateEditors = () => {
            const cmElement = this.htmlEditor.getWrapperElement();
            cmElement.setAttribute('tabindex', '0');
            this.htmlEditor.refresh();
            this.htmlEditor.focus();
        };
        window.requestAnimationFrame(() => {
            setTimeout(activateEditors, 800);
        });
        saveAndRenderComponent();
    }
    async onClose() {
        this.htmlEditor.toTextArea();
        this.cssEditor.toTextArea();
        this.jsEditor.toTextArea();
    }
}

class ObsidianUIStudio extends obsidian.Plugin {
    async onload() {
        this.registerView(VIEW_TYPE_STUDIO, (leaf) => new ComponentStudioView(leaf, this));
        this.addRibbonIcon('layers-3', 'Open Component Studio', () => {
            this.activateView();
        });
    }
    onunload() {
    }
    async activateView() {
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_STUDIO);
        const rightLeaf = this.app.workspace.getRightLeaf(false);
        if (rightLeaf) {
            await rightLeaf.setViewState({
                type: VIEW_TYPE_STUDIO,
                active: true,
            });
            this.app.workspace.revealLeaf(rightLeaf);
        }
    }
}

module.exports = ObsidianUIStudio;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsic3JjL2NvbXBvbmVudFN0dWRpb1ZpZXcudHMiLCJzcmMvbWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6W251bGwsbnVsbF0sIm5hbWVzIjpbIkl0ZW1WaWV3IiwiTm90aWNlIiwiUGx1Z2luIl0sIm1hcHBpbmdzIjoiOzs7O0FBcUJPLE1BQU0sZ0JBQWdCLEdBQUcsdUJBQXVCO0FBRWpELE1BQU8sbUJBQW9CLFNBQVFBLGlCQUFRLENBQUE7SUFPN0MsV0FBQSxDQUFZLElBQW1CLEVBQUUsTUFBYyxFQUFBO1FBQzNDLEtBQUssQ0FBQyxJQUFJLENBQUM7QUFDWCxRQUFBLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTTtJQUN4QjtJQUVBLFdBQVcsR0FBQTtBQUNQLFFBQUEsT0FBTyxnQkFBZ0I7SUFDM0I7SUFFQSxjQUFjLEdBQUE7QUFDVixRQUFBLE9BQU8sa0JBQWtCO0lBQzdCO0FBRUEsSUFBQSxNQUFNLE1BQU0sR0FBQTtRQUNSLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUM5QyxTQUFTLENBQUMsS0FBSyxFQUFFO0FBQ2pCLFFBQUEsU0FBUyxDQUFDLFFBQVEsQ0FBQyw4QkFBOEIsQ0FBQztBQUVsRCxRQUFBLE1BQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLEVBQUUsb0JBQW9CLEVBQUUsQ0FBQztBQUNyRSxRQUFBLE1BQU0sV0FBVyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLEVBQUUscUJBQXFCLEVBQUUsQ0FBQztBQUV2RSxRQUFBLE1BQU0sU0FBUyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLEVBQUUsbUJBQW1CLEVBQUUsQ0FBQztBQUNwRSxRQUFBLE1BQU0sVUFBVSxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLEVBQUUsb0JBQW9CLEVBQUUsQ0FBQztBQUV0RSxRQUFB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

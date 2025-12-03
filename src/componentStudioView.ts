import { ItemView, WorkspaceLeaf, Plugin, Notice } from 'obsidian';

declare global {
    interface EditorInterface {
        refresh(): void;
        toTextArea(): void;
        getValue(): string;
        focus(): void;
        getWrapperElement(): HTMLElement;
    }

    interface CodeMirror {
        Editor: EditorInterface;
        EditorConfiguration: any;
        fromTextArea(container: HTMLTextAreaElement, options?: any): CodeMirror.Editor;
    }
    interface Window {
        CodeMirror: CodeMirror;
    }
}

export const VIEW_TYPE_STUDIO = 'component-studio-view';

export class ComponentStudioView extends ItemView {
    plugin: Plugin;
    htmlEditor!: CodeMirror.Editor;
    cssEditor!: CodeMirror.Editor;
    jsEditor!: CodeMirror.Editor;
    previewIframe!: HTMLIFrameElement;

    constructor(leaf: WorkspaceLeaf, plugin: Plugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType(): string {
        return VIEW_TYPE_STUDIO;
    }

    getDisplayText(): string {
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

        const switchTab = (tabName: string) => {
            document.querySelectorAll('.studio-tab-button').forEach(btn => btn.removeClass('active'));
            document.querySelectorAll('.studio-tab-panel').forEach(panel => panel.removeClass('active'));

            document.querySelector(`.studio-tab-button:nth-child(${tabName === 'html' ? 1 : tabName === 'css' ? 2 : 3})`)?.addClass('active');
            document.querySelector(`.studio-tab-panel[data-tab="${tabName}"]`)?.addClass('active');
            
            if (tabName === 'html') { this.htmlEditor.refresh(); this.htmlEditor.focus(); }
            if (tabName === 'css') { this.cssEditor.refresh(); this.cssEditor.focus(); }
            if (tabName === 'js') { this.jsEditor.refresh(); this.jsEditor.focus(); }
        };

        htmlTabButton.onclick = () => switchTab('html');
        cssTabButton.onclick = () => switchTab('css');
        jsTabButton.onclick = () => switchTab('js');

        this.htmlEditor = window.CodeMirror.fromTextArea(htmlTextarea as HTMLTextAreaElement, { mode: "htmlmixed", lineNumbers: true, theme: "obsidian" }) as CodeMirror.Editor;
        this.cssEditor = window.CodeMirror.fromTextArea(cssTextarea as HTMLTextAreaElement, { mode: "css", lineNumbers: true, theme: "obsidian" }) as CodeMirror.Editor;
        this.jsEditor = window.CodeMirror.fromTextArea(jsTextarea as HTMLTextAreaElement, { mode: "javascript", lineNumbers: true, theme: "obsidian" }) as CodeMirror.Editor;

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
            new Notice(`Component "${componentName}" saved and rendered!`);
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
        (this.htmlEditor as any).toTextArea();
        (this.cssEditor as any).toTextArea();
        (this.jsEditor as any).toTextArea();
    }
}
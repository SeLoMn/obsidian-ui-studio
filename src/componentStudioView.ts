import { ItemView, WorkspaceLeaf, Plugin, Notice } from 'obsidian';

declare global {
    interface PluginSettings {
        // Empty interface is needed for the compiler
    }
}

export const VIEW_TYPE_STUDIO = 'component-studio-view';

export class ComponentStudioView extends ItemView {
    plugin: Plugin;
    private htmlContent: string = '';
    private cssContent: string = '';
    private jsContent: string = '';
    
    previewIframe!: HTMLIFrameElement;

    constructor(leaf: WorkspaceLeaf, plugin: Plugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType(): string {
        return VIEW_TYPE_STUDIO;
    }

    getDisplayText(): string {
        return 'Component Previewer';
    }

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        container.addClass('obsidian-ui-studio-container');

        const controlsArea = container.createDiv({ cls: 'studio-controls-area' });
        const previewArea = container.createDiv({ cls: 'studio-preview-area' });

        const loadFileIntoState = (fileInput: HTMLInputElement, fileType: 'html' | 'css' | 'js', statusEl: HTMLElement) => {
            fileInput.click();
            
            fileInput.onchange = (e) => {
                const target = e.target as HTMLInputElement;
                if (target.files && target.files.length > 0) {
                    const file = target.files[0];
                    const reader = new FileReader();
                    
                    reader.onload = (event) => {
                        if (event.target && event.target.result) {
                            const content = event.target.result as string;
                            
                            switch (fileType) {
                                case 'html': this.htmlContent = content; break;
                                case 'css': this.cssContent = content; break;
                                case 'js': this.jsContent = content; break;
                            }
                            
                            statusEl.setText(`Loaded: ${file.name}`);
                            statusEl.addClass('is-loaded');
                            new Notice(`Successfully loaded ${fileType.toUpperCase()} file: ${file.name}`);
                        }
                    };
                    
                    reader.onerror = () => {
                        statusEl.setText(`Error loading file.`);
                        statusEl.removeClass('is-loaded');
                        new Notice(`Error reading ${fileType.toUpperCase()} file: ${file.name}`, 0);
                    };
                    
                    reader.readAsText(file);
                }
                target.value = ''; 
                fileInput.onchange = null;
            };
        };

        const createFileSelector = (type: 'html' | 'css' | 'js', accept: string, label: string) => {
            const group = controlsArea.createDiv({ cls: 'studio-file-group' });
            group.createEl('h4', { text: `${label} File:` });
            
            const actionContainer = group.createDiv({ cls: 'studio-file-actions' });
            
            const fileInput = this.containerEl.createEl('input', { type: 'file', cls: 'hidden-file-input', attr: { accept: accept } });
            
            const loadButton = actionContainer.createEl('button', { text: `Import ${label}`, cls: 'studio-load-button' });
            const statusIndicator = actionContainer.createDiv({ text: 'No file selected', cls: 'studio-load-status' });
            
            loadButton.onclick = () => loadFileIntoState(fileInput, type, statusIndicator);
            
            return { group, fileInput, loadButton, statusIndicator };
        };
        
        createFileSelector('html', '.html', 'HTML');
        createFileSelector('css', '.css', 'CSS');
        createFileSelector('js', '.js', 'JS');


        const controls = controlsArea.createDiv({ cls: 'studio-preview-controls mt-4' });
        controls.createEl('h4', { text: 'Component Name (for saving):' });
        const nameInput = controls.createEl('input', { cls: 'studio-name-input', type: 'text', placeholder: 'My Awesome Component' });

        const actions = controls.createDiv({ cls: 'studio-actions' });
        const saveButton = actions.createEl('button', { text: '💾 Save Component', cls: 'studio-save-button' });
        const renderButton = actions.createEl('button', { text: '⟳ Render Preview', cls: 'studio-reload-button' });

        const previewWrapper = previewArea.createDiv({ cls: 'studio-preview-output-wrapper' });
        this.previewIframe = previewWrapper.createEl('iframe', { cls: 'studio-preview-iframe' });

        const saveAndRenderComponent = async () => {
            if (!this.htmlContent) {
                new Notice("Please load an HTML file before rendering.", 5000);
                return;
            }

            const componentName = nameInput.value || 'untitled-component';

            const html = this.htmlContent;
            const css = this.cssContent;
            const js = this.jsContent;

            const componentData = {
                name: componentName,
                html: html,
                css: css,
                js: js,
                timestamp: new Date().toISOString()
            };

            const componentDir = `${this.plugin.app.vault.configDir}/plugins/obsidian-ui-studio/components`;
            await this.plugin.app.vault.adapter.mkdir(componentDir).catch(() => {}); 
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
        
        saveAndRenderComponent();
    }
    
    async onClose() {
    }
}
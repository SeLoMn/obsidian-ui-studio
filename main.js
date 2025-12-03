'use strict';

var obsidian = require('obsidian');

const VIEW_TYPE_STUDIO = 'component-studio-view';
class ComponentStudioView extends obsidian.ItemView {
    constructor(leaf, plugin) {
        super(leaf);
        this.htmlContent = '';
        this.cssContent = '';
        this.jsContent = '';
        this.plugin = plugin;
    }
    getViewType() {
        return VIEW_TYPE_STUDIO;
    }
    getDisplayText() {
        return 'Component Previewer';
    }
    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        container.addClass('obsidian-ui-studio-container');
        const controlsArea = container.createDiv({ cls: 'studio-controls-area' });
        const previewArea = container.createDiv({ cls: 'studio-preview-area' });
        const loadFileIntoState = (fileInput, fileType, statusEl) => {
            fileInput.click();
            fileInput.onchange = (e) => {
                const target = e.target;
                if (target.files && target.files.length > 0) {
                    const file = target.files[0];
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        if (event.target && event.target.result) {
                            const content = event.target.result;
                            switch (fileType) {
                                case 'html':
                                    this.htmlContent = content;
                                    break;
                                case 'css':
                                    this.cssContent = content;
                                    break;
                                case 'js':
                                    this.jsContent = content;
                                    break;
                            }
                            statusEl.setText(`Loaded: ${file.name}`);
                            statusEl.addClass('is-loaded');
                            new obsidian.Notice(`Successfully loaded ${fileType.toUpperCase()} file: ${file.name}`);
                        }
                    };
                    reader.onerror = () => {
                        statusEl.setText(`Error loading file.`);
                        statusEl.removeClass('is-loaded');
                        new obsidian.Notice(`Error reading ${fileType.toUpperCase()} file: ${file.name}`, 0);
                    };
                    reader.readAsText(file);
                }
                target.value = '';
                fileInput.onchange = null;
            };
        };
        const createFileSelector = (type, accept, label) => {
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
                new obsidian.Notice("Please load an HTML file before rendering.", 5000);
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
            await this.plugin.app.vault.adapter.mkdir(componentDir).catch(() => { });
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
        saveAndRenderComponent();
    }
    async onClose() {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsic3JjL2NvbXBvbmVudFN0dWRpb1ZpZXcudHMiLCJzcmMvbWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6W251bGwsbnVsbF0sIm5hbWVzIjpbIkl0ZW1WaWV3IiwiTm90aWNlIiwiUGx1Z2luIl0sIm1hcHBpbmdzIjoiOzs7O0FBUU8sTUFBTSxnQkFBZ0IsR0FBRyx1QkFBdUI7QUFFakQsTUFBTyxtQkFBb0IsU0FBUUEsaUJBQVEsQ0FBQTtJQVE3QyxXQUFBLENBQVksSUFBbUIsRUFBRSxNQUFjLEVBQUE7UUFDM0MsS0FBSyxDQUFDLElBQUksQ0FBQztRQVBQLElBQUEsQ0FBQSxXQUFXLEdBQVcsRUFBRTtRQUN4QixJQUFBLENBQUEsVUFBVSxHQUFXLEVBQUU7UUFDdkIsSUFBQSxDQUFBLFNBQVMsR0FBVyxFQUFFO0FBTTFCLFFBQUEsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNO0lBQ3hCO0lBRUEsV0FBVyxHQUFBO0FBQ1AsUUFBQSxPQUFPLGdCQUFnQjtJQUMzQjtJQUVBLGNBQWMsR0FBQTtBQUNWLFFBQUEsT0FBTyxxQkFBcUI7SUFDaEM7QUFFQSxJQUFBLE1BQU0sTUFBTSxHQUFBO1FBQ1IsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQzlDLFNBQVMsQ0FBQyxLQUFLLEVBQUU7QUFDakIsUUFBQSxTQUFTLENBQUMsUUFBUSxDQUFDLDhCQUE4QixDQUFDO0FBRWxELFFBQUEsTUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxzQkFBc0IsRUFBRSxDQUFDO0FBQ3pFLFFBQUEsTUFBTSxXQUFXLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxxQkFBcUIsRUFBRSxDQUFDO1FBRXZFLE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxTQUEyQixFQUFFLFFBQStCLEVBQUUsUUFBcUIsS0FBSTtZQUM5RyxTQUFTLENBQUMsS0FBSyxFQUFFO0FBRWpCLFlBQUEsU0FBUyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsS0FBSTtBQUN2QixnQkFBQSxNQUFNLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBMEI7QUFDM0MsZ0JBQUEsSUFBSSxNQUFNLENBQUMsS0FBSyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDekMsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDNUIsb0JBQUEsTUFBTSxNQUFNLEdBQUcsSUFBSSxVQUFVLEVBQUU7QUFFL0Isb0JBQUEsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEtBQUssS0FBSTt3QkFDdEIsSUFBSSxLQUFLLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO0FBQ3JDLDRCQUFBLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBZ0I7NEJBRTdDLFFBQVEsUUFBUTtBQUNaLGdDQUFBLEtBQUssTUFBTTtBQUFFLG9DQUFBLElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTztvQ0FBRTtBQUN6QyxnQ0FBQSxLQUFLLEtBQUs7QUFBRSxvQ0FBQSxJQUFJLENBQUMsVUFBVSxHQUFHLE9BQU87b0NBQUU7QUFDdkMsZ0NBQUEsS0FBSyxJQUFJO0FBQUUsb0NBQUEsSUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPO29DQUFFOzs0QkFHekMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFBLFFBQUEsRUFBVyxJQUFJLENBQUMsSUFBSSxDQUFBLENBQUUsQ0FBQztBQUN4Qyw0QkFBQSxRQUFRLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQztBQUM5Qiw0QkFBQSxJQUFJQyxlQUFNLENBQUMsQ0FBQSxvQkFBQSxFQUF1QixRQUFRLENBQUMsV0FBVyxFQUFFLENBQUEsT0FBQSxFQUFVLElBQUksQ0FBQyxJQUFJLENBQUEsQ0FBRSxDQUFDO3dCQUNsRjtBQUNKLG9CQUFBLENBQUM7QUFFRCxvQkFBQSxNQUFNLENBQUMsT0FBTyxHQUFHLE1BQUs7QUFDbEIsd0JBQUEsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFBLG1CQUFBLENBQXFCLENBQUM7QUFDdkMsd0JBQUEsUUFBUSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUM7QUFDakMsd0JBQUEsSUFBSUEsZUFBTSxDQUFDLENBQUEsY0FBQSxFQUFpQixRQUFRLENBQUMsV0FBVyxFQUFFLENBQUEsT0FBQSxFQUFVLElBQUksQ0FBQyxJQUFJLENBQUEsQ0FBRSxFQUFFLENBQUMsQ0FBQztBQUMvRSxvQkFBQSxDQUFDO0FBRUQsb0JBQUEsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7Z0JBQzNCO0FBQ0EsZ0JBQUEsTUFBTSxDQUFDLEtBQUssR0FBRyxFQUFFO0FBQ2pCLGdCQUFBLFNBQVMsQ0FBQyxRQUFRLEdBQUcsSUFBSTtBQUM3QixZQUFBLENBQUM7QUFDTCxRQUFBLENBQUM7UUFFRCxNQUFNLGtCQUFrQixHQUFHLENBQUMsSUFBMkIsRUFBRSxNQUFjLEVBQUUsS0FBYSxLQUFJO0FBQ3RGLFlBQUEsTUFBTSxLQUFLLEdBQUcsWUFBWSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxtQkFBbUIsRUFBRSxDQUFDO0FBQ2xFLFlBQUEsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQSxFQUFHLEtBQUssQ0FBQSxNQUFBLENBQVEsRUFBRSxDQUFDO0FBRWhELFlBQUEsTUFBTSxlQUFlLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxxQkFBcUIsRUFBRSxDQUFDO0FBRXZFLFlBQUEsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsbUJBQW1CLEVBQUUsSUFBSSxFQUFFLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFLENBQUM7WUFFMUgsTUFBTSxVQUFVLEdBQUcsZUFBZSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQSxPQUFBLEVBQVUsS0FBSyxFQUFFLEVBQUUsR0FBRyxFQUFFLG9CQUFvQixFQUFFLENBQUM7QUFDN0csWUFBQSxNQUFNLGVBQWUsR0FBRyxlQUFlLENBQUMsU0FBUyxDQUFDLEVBQUUsSUFBSSxFQUFFLGtCQUFrQixFQUFFLEdBQUcsRUFBRSxvQkFBb0IsRUFBRSxDQUFDO0FBRTFHLFlBQUEsVUFBVSxDQUFDLE9BQU8sR0FBRyxNQUFNLGlCQUFpQixDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsZUFBZSxDQUFDO1lBRTlFLE9BQU8sRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUU7QUFDNUQsUUFBQSxDQUFDO0FBRUQsUUFBQSxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQztBQUMzQyxRQUFBLGtCQUFrQixDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDO0FBQ3hDLFFBQUEsa0JBQWtCLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUM7QUFHckMsUUFBQSxNQUFNLFFBQVEsR0FBRyxZQUFZLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBRyxFQUFFLDhCQUE4QixFQUFFLENBQUM7UUFDaEYsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsOEJBQThCLEVBQUUsQ0FBQztRQUNqRSxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFFLEdBQUcsRUFBRSxtQkFBbUIsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxzQkFBc0IsRUFBRSxDQUFDO0FBRTdILFFBQUEsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxnQkFBZ0IsRUFBRSxDQUFDO0FBQzdELFFBQUEsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLEVBQUUsbUJBQW1CLEVBQUUsR0FBRyxFQUFFLG9CQUFvQixFQUFFLENBQUM7QUFDdkcsUUFBQSxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksRUFBRSxrQkFBa0IsRUFBRSxHQUFHLEVBQUUsc0JBQXNCLEVBQUUsQ0FBQztBQUUxRyxRQUFBLE1BQU0sY0FBYyxHQUFHLFdBQVcsQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLEVBQUUsK0JBQStCLEVBQUUsQ0FBQztBQUN0RixRQUFBLElBQUksQ0FBQyxhQUFhLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsRUFBRSxHQUFHLEVBQUUsdUJBQXVCLEVBQUUsQ0FBQztBQUV4RixRQUFBLE1BQU0sc0JBQXNCLEdBQUcsWUFBVztBQUN0QyxZQUFBLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFO0FBQ25CLGdCQUFBLElBQUlBLGVBQU0sQ0FBQyw0Q0FBNEMsRUFBRSxJQUFJLENBQUM7Z0JBQzlEO1lBQ0o7QUFFQSxZQUFBLE1BQU0sYUFBYSxHQUFHLFNBQVMsQ0FBQyxLQUFLLElBQUksb0JBQW9CO0FBRTdELFlBQUEsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVc7QUFDN0IsWUFBQSxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBVTtBQUMzQixZQUFBLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxTQUFTO0FBRXpCLFlBQUEsTUFBTSxhQUFhLEdBQUc7QUFDbEIsZ0JBQUEsSUFBSSxFQUFFLGFBQWE7QUFDbkIsZ0JBQUEsSUFBSSxFQUFFLElBQUk7QUFDVixnQkFBQSxHQUFHLEVBQUUsR0FBRztBQUNSLGdCQUFBLEVBQUUsRUFBRSxFQUFFO0FBQ04sZ0JBQUEsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVzthQUNwQztBQUVELFlBQUEsTUFBTSxZQUFZLEdBQUcsQ0FBQSxFQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLHdDQUF3QztZQUMvRixNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFLLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZFLFlBQUEsTUFBTSxRQUFRLEdBQUcsQ0FBQSxFQUFHLFlBQVksQ0FBQSxDQUFBLEVBQUksYUFBYSxDQUFDLFdBQVcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsR0FBRyxDQUFDLE9BQU87WUFFakcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBRTNGLFlBQUEsTUFBTSxhQUFhLEdBQUcsQ0FBQTs7Ozs2QkFJTCxHQUFHLENBQUE7OztzQkFHVixJQUFJLENBQUE7Ozs4QkFHSSxFQUFFLENBQUE7Ozs7O2FBS25CO0FBQ0QsWUFBQSxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxFQUFFO2dCQUNsQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxRQUFRO2dCQUNyRCxHQUFHLENBQUMsSUFBSSxFQUFFO0FBQ1YsZ0JBQUEsR0FBRyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUM7Z0JBQ3hCLEdBQUcsQ0FBQyxLQUFLLEVBQUU7WUFDZjtBQUNBLFlBQUEsSUFBSUEsZUFBTSxDQUFDLENBQUEsV0FBQSxFQUFjLGFBQWEsQ0FBQSxxQkFBQSxDQUF1QixDQUFDO0FBQ2xFLFFBQUEsQ0FBQztBQUVELFFBQUEsWUFBWSxDQUFDLE9BQU8sR0FBRyxzQkFBc0I7QUFDN0MsUUFBQSxVQUFVLENBQUMsT0FBTyxHQUFHLHNCQUFzQjtBQUUzQyxRQUFBLHNCQUFzQixFQUFFO0lBQzVCO0FBRUEsSUFBQSxNQUFNLE9BQU8sR0FBQTtJQUNiO0FBQ0g7O0FDckthLE1BQU8sZ0JBQWlCLFNBQVFDLGVBQU0sQ0FBQTtBQUNoRCxJQUFBLE1BQU0sTUFBTSxHQUFBO0FBQ1IsUUFBQSxJQUFJLENBQUMsWUFBWSxDQUNiLGdCQUFnQixFQUNoQixDQUFDLElBQUksS0FBSyxJQUFJLG1CQUFtQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FDaEQ7UUFFRCxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSx1QkFBdUIsRUFBRSxNQUFLO1lBQ3pELElBQUksQ0FBQyxZQUFZLEVBQUU7QUFDdkIsUUFBQSxDQUFDLENBQUM7SUFDTjtJQUVBLFFBQVEsR0FBQTtJQUVSO0FBRUEsSUFBQSxNQUFNLFlBQVksR0FBQTtRQUNkLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDLGdCQUFnQixDQUFDO0FBRXZELFFBQUEsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQztRQUV4RCxJQUFJLFNBQVMsRUFBRTtZQUNYLE1BQU0sU0FBUyxDQUFDLFlBQVksQ0FBQztBQUN6QixnQkFBQSxJQUFJLEVBQUUsZ0JBQWdCO0FBQ3RCLGdCQUFBLE1BQU0sRUFBRSxJQUFJO0FBQ2YsYUFBQSxDQUFDO1lBRUYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUN6QixTQUFTLENBQ1o7UUFDTDtJQUNKO0FBQ0g7Ozs7In0=

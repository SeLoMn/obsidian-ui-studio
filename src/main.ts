import { Plugin } from 'obsidian';
import { ComponentStudioView, VIEW_TYPE_STUDIO } from './componentStudioView';

export default class ObsidianUIStudio extends Plugin {
    async onload() {
        this.registerView(
            VIEW_TYPE_STUDIO,
            (leaf) => new ComponentStudioView(leaf, this)
        );

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

            this.app.workspace.revealLeaf(
                rightLeaf
            );
        }
    }
}
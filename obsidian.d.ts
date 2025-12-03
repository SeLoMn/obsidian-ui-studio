declare module 'obsidian' {
  export class Plugin {
    app: any;
    registerView(viewType: string, callback: (leaf: any) => any): void;
    addRibbonIcon(icon: string, title: string, callback: () => void): void;
    onload(): void;
    onunload(): void;
  }

  export class WorkspaceLeaf {
    setViewState(viewState: any): Promise<void>;
  }

  export class ItemView {
    leaf: WorkspaceLeaf;
    viewType: string;
    containerEl: any;
    constructor(leaf: WorkspaceLeaf);
    onOpen(): void;
    onClose(): void;
  }
}

import MathJaxPreamblePlugin from "main";
import { App, Component, Notice, TAbstractFile, TFile, TFolder, normalizePath, renderMath } from "obsidian";

export interface Preamble {
    path: string;
    content?: string;
}

export interface SerializedPreambles {
    preambles: { path: string }[];
    folderPreambles: { folderPath: string, preamblePath: string }[];
}

export class PreambleManager extends Component {
    app: App;
    /** Maps preamble path to preamble. */
    preambles: Map<string, Preamble>;
    /** Maps folder path to preamble path. */
    folderPreambles: Map<string, string>;
    /** Stores the path of the last loaded preamble. */
    lastPreamblePath: string | null;

    constructor(public plugin: MathJaxPreamblePlugin, private serialized: SerializedPreambles) {
        super();
        this.app = plugin.app;
        this.preambles = new Map();
        this.folderPreambles = new Map<string, string>();
        this.lastPreamblePath = null;
    }

    onload() {
        this.app.workspace.onLayoutReady(async () => {
            await this.deserialize(this.serialized);
            this.plugin.rerender();
        });
        this.registerEvent(this.app.vault.on('modify', (file) => this.onModify(file)));
        this.registerEvent(this.app.vault.on('rename', (file, oldPath) => this.onRename(file, oldPath)));
        this.registerEvent(this.app.vault.on('delete', (file) => this.onDelete(file)));
    }

    serialize(): SerializedPreambles {
        return {
            preambles: [...this.preambles.values()].map(({ path }) => ({ path })),
            folderPreambles: [...this.folderPreambles.entries()].map(([folderPath, preamblePath]) => ({ folderPath, preamblePath }))
        };
    }

    async deserialize(data: SerializedPreambles) {
        this.preambles = new Map();
        const promises = [];

        for (const { path } of data.preambles) {
            if (!path) continue;
            const file = this.app.vault.getAbstractFileByPath(path);
            if (file instanceof TFile) {
                promises.push(
                    this.app.vault.read(file).then(
                        (content) => this.preambles.set(path, { path, content: this.preprocess(content) })
                    )
                );
            } else {
                new Notice(`${this.plugin.manifest.name}: Preamble file ${path} not found.`);
            }
        }

        await Promise.all(promises);

        this.folderPreambles = new Map<string, string>();
        for (const { folderPath, preamblePath } of data.folderPreambles) {
            this.folderPreambles.set(normalizePath(folderPath), preamblePath);
        }
    }

    preprocess(data: string): string {
        data = data.trim();
        if (data.startsWith('```')) {
            const lineBreak = data.indexOf('\n');
            if (lineBreak === -1) data = data.slice(3).trim();
            else data = data.slice(lineBreak + 1).trim(); // ignore language
        }
        if (data.endsWith('```')) data = data.slice(0, -3).trim();
        if (data.startsWith('$$')) data = data.slice(2).trim();
        if (data.endsWith('$$')) data = data.slice(0, -2).trim();
        if (data.startsWith('$')) data = data.slice(1).trim();
        if (data.endsWith('$')) data = data.slice(0, -1).trim();
        return data;
    }

    async onModify(file: TAbstractFile) {
        if (file instanceof TFile) {
            for (const { path } of this.preambles.values()) {
                if (path === file.path) {
                    const content = await this.app.vault.read(file);
                    this.preambles.set(path, { path, content: this.preprocess(content) });
                    this.plugin.rerender();
                }
            }
        }
    }

    onRename(file: TAbstractFile, oldPath: string) {
        if (file instanceof TFile) this.onFileRename(file, oldPath);
        if (file instanceof TFolder) this.onFolderRename(file, oldPath);
        this.plugin.saveSettings();
    }

    onFileRename(file: TFile, oldPath: string) {
        for (const { path, content } of this.preambles.values()) {
            if (path === oldPath) {
                this.preambles.set(file.path, { path: file.path, content: content ? this.preprocess(content) : undefined });
                this.preambles.delete(oldPath);
            }
        }
        for (const [folderPath, preamblePath] of this.folderPreambles.entries()) {
            if (preamblePath === oldPath) {
                this.folderPreambles.set(folderPath, file.path);
            }
        }
    }

    onFolderRename(folder: TFolder, oldPath: string) {
        for (const { path, content } of this.preambles.values()) {
            if (path.startsWith(normalizePath(oldPath + '/'))) {
                const newPath = path.replace(oldPath, folder.path);
                this.preambles.delete(path);
                this.preambles.set(newPath, { path: newPath, content });

            }
        }
        for (const [folderPath, preamblePath] of this.folderPreambles.entries()) {
            const oldFolderPath = normalizePath(oldPath + '/');
            const newFolderPath = normalizePath(folder.path + '/');
            if (folderPath === oldPath) {
                this.folderPreambles.delete(oldFolderPath);
                this.folderPreambles.set(newFolderPath, preamblePath.replace(oldFolderPath, newFolderPath));
            } else if (folderPath.startsWith(oldFolderPath) || preamblePath.startsWith(oldFolderPath)) {
                this.folderPreambles.delete(folderPath);
                this.folderPreambles.set(
                    folderPath.replace(oldFolderPath, newFolderPath),
                    preamblePath.replace(oldFolderPath, newFolderPath)
                );
            }
        }
    }

    onDelete(file: TAbstractFile) {
        if (file instanceof TFile) this.onFileDelete(file);
        if (file instanceof TFolder) this.onFolderDelete(file);
        this.plugin.saveSettings();
    }

    onFileDelete(file: TFile) {
        this.preambles.delete(file.path);
        for (const [folderPath, preamblePath] of this.folderPreambles.entries()) {
            if (preamblePath === file.path) {
                this.folderPreambles.delete(folderPath);
            }
        }
    }

    onFolderDelete(folder: TFolder) {
        for (const { path } of this.preambles.values()) {
            if (path.startsWith(normalizePath(folder.path + '/'))) {
                this.preambles.delete(path);
            }
        }
        for (const [folderPath, preamblePath] of this.folderPreambles.entries()) {
            if (folder.path === folderPath || folderPath.startsWith(normalizePath(folder.path + '/')) || preamblePath.startsWith(normalizePath(folder.path + '/'))) {
                this.folderPreambles.delete(folderPath);
            }
        }
    }

    resolvedPreamble(sourcePath: string, frontmatter?: { preamble?: string }): Preamble | null {
        if (typeof frontmatter?.preamble === 'string') {
            let preamblePath = frontmatter.preamble;
            if (preamblePath.startsWith('[[') && preamblePath.endsWith(']]')) {
                preamblePath = preamblePath.slice(2, -2);
            }
            const preambleFile = this.app.metadataCache.getFirstLinkpathDest(preamblePath, sourcePath);
            if (preambleFile) {
                const preamble = [...this.preambles.values()].find(({ path }) => path === preambleFile.path);
                if (preamble) return preamble
            }
        }

        const file = this.app.vault.getAbstractFileByPath(sourcePath);
        let folder = file?.parent;
        while (folder) {
            const preamblePath = this.folderPreambles.get(folder.path);
            if (preamblePath) {
                return this.preambles.get(preamblePath) ?? null;
            }
            folder = folder.parent;
        }
        return null;
    }

    loadPreamble(sourcePath: string, frontmatter?: { preamble?: string }) {
        const preamble = this.resolvedPreamble(sourcePath, frontmatter);
        if (preamble?.content) {
            if (this.lastPreamblePath !== preamble.path) {
                renderMath(preamble.content, false);
                this.lastPreamblePath = preamble.path;
            }
        }
    }

    forgetHistory() {
        this.lastPreamblePath = null;
    }
}

import MathJaxPreamblePlugin from "main";
import { App, Component, Notice, TAbstractFile, TFile, TFolder, normalizePath, renderMath } from "obsidian";

export interface Preamble {
    id: string,
    path: string;
    content?: string;
}

export interface SerializedPreambles {
    preambles: { id: string, path: string }[];
    folderPreambes: { folderPath: string, preambleId: string }[];
}

export class PreambleManager extends Component {
    app: App;
    /** Maps preamble id to preamble. */
    preambles: Map<string, Preamble>;
    /** Maps folder path to preamble id. */
    folderPreambles: Map<string, string>;

    constructor(public plugin: MathJaxPreamblePlugin, private serialized: SerializedPreambles) {
        super();
        this.app = plugin.app;
        this.preambles = new Map();
        this.folderPreambles = new Map<string, string>();
    }

    onload() {
        this.app.workspace.onLayoutReady(async () => this.deserialize(this.serialized));
        this.registerEvent(this.app.vault.on('modify', (file) => this.onModify(file)));
        this.registerEvent(this.app.vault.on('rename', (file, oldPath) => this.onRename(file, oldPath)));
        this.registerEvent(this.app.vault.on('delete', (file) => this.onDelete(file)));
    }

    serialize(): SerializedPreambles {
        return {
            preambles: [...this.preambles.values()].map(({ id, path }) => ({ id, path })),
            folderPreambes: [...this.folderPreambles.entries()].map(([folderPath, preambleId]) => ({ folderPath, preambleId }))
        };
    }

    async deserialize(data: SerializedPreambles) {
        this.preambles = new Map();
        const promises = [];

        for (const { id, path } of data.preambles) {
            if (!path || !id) continue;
            const file = this.app.vault.getAbstractFileByPath(path);
            if (file instanceof TFile) {
                promises.push(
                    this.app.vault.read(file).then(
                        (content) => this.preambles.set(id, { id, path, content })
                    )
                );
            } else {
                new Notice(`${this.plugin.manifest.name}: Preamble file ${path} not found.`);
            }
        }

        await Promise.all(promises);

        this.folderPreambles = new Map<string, string>();
        for (const { folderPath, preambleId } of data.folderPreambes) {
            this.folderPreambles.set(normalizePath(folderPath), preambleId);
        }
    }

    preprocess(data: string): string {
        data = data.trim();
        if (data.startsWith('```')) data = data.slice(3).trim();
        if (data.endsWith('```')) data = data.slice(0, -3).trim();
        if (data.startsWith('$$')) data = data.slice(2).trim();
        if (data.endsWith('$$')) data = data.slice(0, -2).trim();
        if (data.startsWith('$')) data = data.slice(1).trim();
        if (data.endsWith('$')) data = data.slice(0, -1).trim();
        return data;
    }

    async onModify(file: TAbstractFile) {
        if (file instanceof TFile) {
            for (const [id, { path }] of this.preambles.entries()) {
                if (path === file.path) {
                    const content = await this.app.vault.read(file);
                    this.preambles.set(id, { id, path, content: this.preprocess(content) });
                }
            }
        }
    }

    onRename(file: TAbstractFile, oldPath: string) {
        if (file instanceof TFile) this.onFileRename(file, oldPath);
        if (file instanceof TFolder) this.onFolderRename(file, oldPath);
    }

    onFileRename(file: TFile, oldPath: string) {
        for (const { id, path, content } of this.preambles.values()) {
            if (path === oldPath) {
                this.preambles.set(id, { id, path: file.path, content: content ? this.preprocess(content) : undefined });
            }
        }
    }

    onFolderRename(folder: TFolder, oldPath: string) {
        for (const { id, path, content } of this.preambles.values()) {
            if (path.startsWith(normalizePath(oldPath + '/'))) {
                this.preambles.set(id, { id, path: path.replace(oldPath, folder.path), content });
            }
        }
        for (const [folderPath, preambleId] of this.folderPreambles.entries()) {
            if (folderPath === oldPath || folderPath.startsWith(normalizePath(oldPath + '/'))) {
                this.folderPreambles.set(folderPath.replace(oldPath, folder.path), preambleId);
                this.folderPreambles.delete(folderPath);
            }
        }
    }

    onDelete(file: TAbstractFile) {
        if (file instanceof TFile) this.onFileDelete(file);
        if (file instanceof TFolder) this.onFolderDelete(file);
    }

    onFileDelete(file: TFile) {
        for (const { id, path } of this.preambles.values()) {
            if (path === file.path) {
                this.preambles.delete(id);
            }
        }
    }

    onFolderDelete(folder: TFolder) {
        for (const { id, path } of this.preambles.values()) {
            if (path.startsWith(normalizePath(folder.path + '/'))) {
                this.preambles.delete(id);
            }
        }
        for (const folderPath of this.folderPreambles.keys()) {
            if (folderPath === folder.path || folderPath.startsWith(normalizePath(folder.path + '/'))) {
                this.folderPreambles.delete(folderPath);
            }
        }
    }

    resolvedPreamble(sourcePath: string, frontmatter?: {preamble?: string}): Preamble | null {
        if (frontmatter?.preamble) {
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
            const id = this.folderPreambles.get(folder.path);
            if (id) {
                return this.preambles.get(id) ?? null;
            }
            folder = folder.parent;
        }
        return null;
    }

    loadPreamble(sourcePath: string, frontmatter?: {preamble?: string}) {
        const preamble = this.resolvedPreamble(sourcePath, frontmatter);
        if (preamble?.content) {
            renderMath(preamble.content, false);
        }
    }
}

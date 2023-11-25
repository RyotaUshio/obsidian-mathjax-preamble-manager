import MathJaxPreamblePlugin from 'main';
import { SerializedPreambles } from "manager";
import { AbstractInputSuggest, TFile, TFolder } from "obsidian";

abstract class AbstractPathSuggest<T extends { path: string }> extends AbstractInputSuggest<T> {
    constructor(public plugin: MathJaxPreamblePlugin, textInputEl: HTMLInputElement | HTMLDivElement) {
        super(plugin.app, textInputEl);
    }

    renderSuggestion({ path }: T, el: HTMLElement) {
        el.setText(path);
    }

    selectSuggestion({ path }: T) {
        // super.selectSuggestion calls the callbacks registered via onSelect
        // (alternatively, we can do this.selectCb?.({ path }))
        // @ts-ignore
        super.selectSuggestion({ path });
        this.setValue(path);
        // @ts-ignore
        this.suggestEl.hide();
    }
}


export class PreambleSuggest extends AbstractPathSuggest<{ path: string }> {
    constructor(plugin: MathJaxPreamblePlugin, textInputEl: HTMLInputElement | HTMLDivElement, private serialized: SerializedPreambles) {
        super(plugin, textInputEl);
    }

    getSuggestions(query: string) {
        return this.serialized.preambles.filter(preamble => {
            return preamble.path.toLowerCase().includes(query.toLowerCase())
        });
    }
}

export class FileSuggest extends AbstractPathSuggest<TFile> {
    getSuggestions(query: string) {
        return this.plugin.app.vault.getFiles().filter(file => file.path.toLowerCase().includes(query.toLowerCase()));
    }
}

export class FolderSuggest extends AbstractPathSuggest<TFolder> {
    getSuggestions(query: string) {
        return this.plugin.app.vault
            .getAllLoadedFiles()
            .filter((folder): folder is TFolder => folder instanceof TFolder && folder.path.toLowerCase().includes(query.toLowerCase()));
    }
}
import { Transaction, EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import MathJaxPreamblePlugin from "main";
import { around } from 'monkey-around';
import { editorInfoField } from 'obsidian';

export const patchEditorView = (plugin: MathJaxPreamblePlugin) => {
    plugin.register(around(EditorView.prototype, {
        update(old) {
            return function (transactions: readonly Transaction[]) {
                const sourcePath = (this.state as EditorState).field(editorInfoField, false)?.file?.path ?? '';
                plugin.manager.loadPreamble(sourcePath, plugin.app.metadataCache.getCache(sourcePath)?.frontmatter);
                return old.call(this, transactions);
            }
        }
    }));
};
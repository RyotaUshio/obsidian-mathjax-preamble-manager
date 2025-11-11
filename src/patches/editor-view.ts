import type MathJaxPreamblePlugin from '@/main';
import { EditorView } from '@codemirror/view';
import { around } from 'monkey-around';
import { editorInfoField } from 'obsidian';

export const patchEditorView = (plugin: MathJaxPreamblePlugin) => {
    plugin.register(
        around(EditorView.prototype, {
            update(old) {
                return function (this: EditorView, ...args) {
                    const sourcePath =
                        this.state.field(editorInfoField, false)?.file?.path ??
                        '';
                    plugin.manager.loadPreamble(
                        sourcePath,
                        plugin.app.metadataCache.getCache(sourcePath)
                            ?.frontmatter,
                    );
                    return old.apply(this, args);
                };
            },
        }),
    );
};

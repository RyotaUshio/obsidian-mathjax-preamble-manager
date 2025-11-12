import type { SetCtxFunction } from '@/instance';
import { EditorView } from '@codemirror/view';
import { around } from 'monkey-around';
import { editorInfoField } from 'obsidian';

export const patchEditorView = (setCtx: SetCtxFunction) => {
    return around(EditorView.prototype, {
        update: next =>
            function (this: EditorView, ...args) {
                const file =
                    this.state.field(editorInfoField, false)?.file ?? null;
                setCtx({ file });
                return next.apply(this, args);
            },
    });
};

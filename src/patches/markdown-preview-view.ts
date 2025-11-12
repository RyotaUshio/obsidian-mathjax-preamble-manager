import type { SetCtxFunction } from '@/instance';
import { around } from 'monkey-around';
import type { App, MarkdownPostProcessorContext } from 'obsidian';
import { MarkdownPreviewView } from 'obsidian';

export const patchMarkdownPreviewView = (setCtx: SetCtxFunction) => {
    return around(
        MarkdownPreviewView as typeof MarkdownPreviewView & {
            postProcess: (
                app: App,
                ctx: MarkdownPostProcessorContext,
            ) => unknown;
        },
        {
            postProcess: next =>
                function (this: typeof MarkdownPreviewView, app, ctx) {
                    const file = app.vault.getFileByPath(ctx.sourcePath);
                    setCtx({ file });
                    return next.call(this, app, ctx);
                },
        },
    );
};

import type MathJaxPreamblePlugin from '@/main';
import { around } from 'monkey-around';
import type { App, MarkdownPostProcessorContext } from 'obsidian';
import { MarkdownPreviewView } from 'obsidian';

export const patchMarkdownPreviewView = (plugin: MathJaxPreamblePlugin) => {
    plugin.register(
        around(MarkdownPreviewView, {
            // @ts-expect-error: MarkdownPreviewView.postProcess is not public
            postProcess(old) {
                return function (
                    this: MarkdownPreviewView,
                    app: App,
                    ctx: MarkdownPostProcessorContext,
                ) {
                    plugin.manager.loadPreamble(
                        ctx.sourcePath,
                        ctx.frontmatter,
                    );
                    return old.call(this, app, ctx);
                };
            },
        }),
    );
};

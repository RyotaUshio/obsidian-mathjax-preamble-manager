import { around } from 'monkey-around';
import MathJaxPreamblePlugin from 'main';
import { App, MarkdownPostProcessorContext, MarkdownPreviewView } from 'obsidian';

export const patchMarkdownPreviewView = (plugin: MathJaxPreamblePlugin) => {
    plugin.register(around(MarkdownPreviewView, {
        // @ts-ignore
        postProcess(old) {
            return function (app: App, ctx: MarkdownPostProcessorContext) {
                plugin.manager.loadPreamble(ctx.sourcePath, ctx.frontmatter);
                return old.call(this, app, ctx);
            }
        }
    }));
};
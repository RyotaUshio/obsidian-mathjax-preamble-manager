import type {
    MathJaxInstance,
    SetCtxFunction,
    UseWhenContext,
} from './instance';
import { createMathJaxInstance } from './instance';
import type { Settings } from './settings/settings';
import { patchMarkdownPreviewView } from './patches/markdown-preview-view';
import { patchEditorView } from './patches/editor-view';
import { loadMathJax } from 'obsidian';

export async function initialize(settings: Settings) {
    await loadMathJax();
    const MathJax = window.MathJax;

    const instances: MathJaxInstance[] = [];
    for (const instance of settings.instances) {
        instances.push(await createMathJaxInstance(instance));
    }
    let ctx: UseWhenContext | null = null;
    const setCtx: SetCtxFunction = params => {
        ctx = params ? { ...params } : null;
    };

    const getActiveInstance = (): MathJaxInstance | null => {
        if (!ctx) return null;
        return instances.find(instance => instance.useWhen(ctx!)) ?? null;
    };

    const { proxy, revoke } = Proxy.revocable(MathJax, {
        get: (target, name, receiver) => {
            const instance = getActiveInstance();
            return Reflect.get(instance?.MathJax ?? target, name, receiver);
        },
    });
    window.MathJax = proxy;
    const cleanupProxy = () => {
        revoke();
        window.MathJax = MathJax;
    };

    const onCleanup = [
        cleanupProxy,
        /** For Reading View */
        patchMarkdownPreviewView(setCtx),
        // Note: The following works as well, but this postprocessor is called for every section element,
        // which is not ideal

        // this.registerMarkdownPostProcessor((el, ctx) => {
        // 	this.manager.loadPreamble(ctx.sourcePath, ctx.frontmatter);
        // }, -Infinity);

        /** For Live Preview */
        patchEditorView(setCtx),

        () => {
            instances.length = 0;
        },
    ];

    const cleanup = () => {
        onCleanup.forEach(fn => fn());
    };

    return cleanup;
}

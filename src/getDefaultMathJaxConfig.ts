import { loadMathJax } from 'obsidian';
import { isMathJaxScript } from './onMathJaxLoaded';
import { around } from 'monkey-around';

let defaultConfig: MathJaxConfig | undefined;

export async function getDefaultMathJaxConfig(): Promise<MathJaxConfig> {
    return structuredClone(
        (defaultConfig ??= await new Promise<MathJaxConfig>(resolve => {
            const cleanup = around(document.body, {
                appendChild: next =>
                    function <T extends Node>(
                        this: HTMLBodyElement,
                        node: T,
                    ): T {
                        if (isMathJaxScript(node)) {
                            resolve(
                                structuredClone(
                                    window.MathJax as unknown as MathJaxConfig,
                                ),
                            );
                            cleanup();
                        }
                        return next.call(this, node) as T;
                    },
            });
            loadMathJax();
        })),
    );
}

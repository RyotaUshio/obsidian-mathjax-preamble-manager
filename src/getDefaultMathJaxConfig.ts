import { loadMathJax } from 'obsidian';
import { isMathJaxScript } from './onMathJaxLoaded';
import { around } from 'monkey-around';

let defaultConfig: any;

export async function getDefaultMathJaxConfig(): Promise<MathJaxConfig> {
    return (defaultConfig ??= await new Promise<any>(resolve => {
        const cleanup = around(document.body, {
            appendChild(next) {
                return function (this, ...args) {
                    if (isMathJaxScript(args[0])) {
                        resolve(
                            structuredClone(window.MathJax as MathJaxConfig),
                        );
                        cleanup();
                    }
                    return next.apply(this, args);
                };
            },
        });
        loadMathJax();
    }));
}

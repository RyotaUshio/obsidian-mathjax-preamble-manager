import { getDefaultMathJaxConfig } from './getDefaultMathJaxConfig';
import type { MathJaxInstanceOptions } from './instance';

export async function reloadMathJax(
    config?: MathJaxInstanceOptions['config'],
): Promise<MathJax> {
    const resolvedConfig = await resolveConfig(config);
    // @ts-expect-error: window.MathJax is a MathJaxConfig right before MathJax is loaded
    window.MathJax = resolvedConfig;

    return new Promise((resolve, reject) => {
        const scriptEl = createEl('script', {
            attr: {
                type: 'text/javascript',
                src: '/lib/mathjax/tex-chtml-full.js',
            },
        });

        scriptEl.addEventListener('load', () => {
            resolve(window.MathJax);
        });
        scriptEl.addEventListener('error', reject);

        document.body.appendChild(scriptEl);
    });
}

async function resolveConfig(
    config?: MathJaxInstanceOptions['config'],
): Promise<MathJaxConfig> {
    const defaultConfig = await getDefaultMathJaxConfig();
    console.assert(!defaultConfig.loader)
    if (typeof config === 'function') {
        config(defaultConfig);
        return defaultConfig;
    }
    return config ?? defaultConfig;
}

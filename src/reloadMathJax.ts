import { getDefaultMathJaxConfig } from './getDefaultMathJaxConfig';

export async function reloadMathJax(): Promise<MathJax> {
    // @ts-expect-error
    window.MathJax = await getDefaultMathJaxConfig();

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

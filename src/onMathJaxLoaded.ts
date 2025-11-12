interface OnMathJaxLoadedOptions {
    once?: boolean;
}

export function onMathJaxLoaded(
    handler: (MathJax: any) => void,
    options?: OnMathJaxLoadedOptions,
) {
    const observer = new MutationObserver(records => {
        for (const record of records) {
            for (const node of record.addedNodes) {
                if (isMathJaxScript(node)) {
                    if (options?.once) {
                        observer.disconnect();
                    }
                    const src = node.getAttribute('src')!;
                    node.removeAttribute('src');
                    try {
                        handler(window.MathJax);
                    } finally {
                        node.setAttribute('src', src);
                    }
                    return;
                }
            }
        }
    });

    observer.observe(document.body, { childList: true });

    const cleanup = () => observer.disconnect();
    return cleanup;
}

export function isMathJaxScript(node: Node): node is HTMLScriptElement {
    return (
        node instanceof HTMLScriptElement &&
        new URL(node.src).pathname === '/lib/mathjax/tex-chtml-full.js'
    );
}

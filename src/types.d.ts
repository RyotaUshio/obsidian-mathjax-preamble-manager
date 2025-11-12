interface MathJax {
    version: string;
    tex2chtml: (tex: string, options?: Record<string, unknown>) => HTMLElement;
    chtmlStylesheet: () => HTMLStyleElement;
}

type MathJaxConfig = Record<string, unknown>;

interface Window {
    MathJax: MathJax;
}

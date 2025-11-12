interface MathJax {
    version: string;
    [key: string]: any;
}

interface MathJaxConfig {
    [key: string]: any;
}

interface Window {
    MathJax: MathJax;
}

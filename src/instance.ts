import { reloadMathJax } from './reloadMathJax';

export type ModifyMathJaxConfigFunction = (MathJax: MathJaxConfig) => void;

export interface MathJaxInstanceOptions {
    useWhen: () => boolean;
    preamble: string;
    config: ModifyMathJaxConfigFunction | MathJaxConfig;
}
export interface MathJaxInstance extends MathJaxInstanceOptions {
    MathJax: MathJax;
}

export async function createMathJaxInstance(
    options: MathJaxInstanceOptions,
): Promise<MathJaxInstance> {
    const oldMathJax = window.MathJax;
    const newMathJax = await reloadMathJax();
    window.MathJax = oldMathJax;
    return {
        MathJax: newMathJax,
        ...options,
    };
}

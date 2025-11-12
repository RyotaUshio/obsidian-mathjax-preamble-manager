import { reloadMathJax } from './reloadMathJax';
import * as v from 'valibot';
import type { DumpedMathJaxInstanceOptions } from './settings/settings';
import type { TFile } from 'obsidian';

export interface UseWhenContext {
    file: TFile | null;
}
export interface UseWhenContextParams {
    file: TFile | null;
}
export type SetCtxFunction = (params: UseWhenContextParams | null) => void;
export type UseWhenFunction = (ctx: UseWhenContext) => boolean;
export type ModifyMathJaxConfigFunction = (MathJax: MathJaxConfig) => void;

export const MathJaxInstanceOptions = v.object({
    useWhen: v.pipe(
        v.string(),
        v.transform(input => new Function('ctx', 'return ' + input)),
        v.custom<UseWhenFunction>(() => true),
    ),
    preamble: v.string(),
    config: v.pipe(
        v.string(),
        v.transform(input => new Function('return ' + input)()),
        v.custom<ModifyMathJaxConfigFunction | MathJaxConfig>(
            input => !!input && ['function', 'object'].includes(typeof input),
        ),
    ),
});

export type MathJaxInstanceOptions = v.InferOutput<
    typeof MathJaxInstanceOptions
>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const __test__: v.InferInput<
    typeof MathJaxInstanceOptions
> extends DumpedMathJaxInstanceOptions
    ? true
    : false = true;

export interface MathJaxInstance extends MathJaxInstanceOptions {
    MathJax: MathJax;
}

export async function createMathJaxInstance(
    options: DumpedMathJaxInstanceOptions,
): Promise<MathJaxInstance> {
    const parsedOptions = v.parse(MathJaxInstanceOptions, options);
    const newMathJax = await reloadMathJax(parsedOptions.config);
    if (options.preamble) {
        newMathJax.tex2chtml(options.preamble);
    }
    return {
        MathJax: newMathJax,
        ...parsedOptions,
    };
}

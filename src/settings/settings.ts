import * as v from 'valibot';

export const DumpedMathJaxInstanceOptions = v.object({
    useWhen: v.fallback(v.string(), 'true'),
    preamble: v.fallback(v.string(), ''),
    config: v.fallback(
        v.string(),
        '(MathJax) => {\n  // Modify the MathJax object here\n}',
    ),
});
export type DumpedMathJaxInstanceOptions = v.InferOutput<
    typeof DumpedMathJaxInstanceOptions
>;

export const Settings = v.object({
    instances: v.fallback(v.array(DumpedMathJaxInstanceOptions), []),
});
export type Settings = v.InferOutput<typeof Settings>;

export function parseSettings(data: unknown): Settings {
    try {
        return v.parse(Settings, data);
    } catch {
        return v.getFallbacks(Settings);
    }
}

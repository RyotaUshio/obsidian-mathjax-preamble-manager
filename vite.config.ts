import builtins from 'builtin-modules';
import 'dotenv/config';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { defineConfig } from 'vite';
import copy from 'rollup-plugin-copy';

const vaults = process.env.VAULTS ? process.env.VAULTS.split(':') : [];
const pluginId = JSON.parse(fs.readFileSync('./manifest.json', 'utf-8')).id;
console.assert(typeof pluginId === 'string');
const dests = vaults.map(vault =>
    path.join(vault, '.obsidian/plugins', pluginId),
);

export default defineConfig(({ mode }) => {
    const prod = mode === 'production';

    return {
        build: {
            lib: {
                entry: 'src/main.ts',
                fileName: 'main',
                cssFileName: 'styles',
                formats: ['cjs'],
            },
            outDir: 'dist',
            minify: prod,
            sourcemap: prod ? false : 'inline',
            cssCodeSplit: false,
            rollupOptions: {
                treeshake: true,
                external: [
                    'obsidian',
                    'electron',
                    '@codemirror/autocomplete',
                    '@codemirror/collab',
                    '@codemirror/commands',
                    '@codemirror/language',
                    '@codemirror/lint',
                    '@codemirror/search',
                    '@codemirror/state',
                    '@codemirror/view',
                    '@lezer/common',
                    '@lezer/highlight',
                    '@lezer/lr',
                    ...builtins,
                ],
            },
        },
        plugins: [
            copy({
                targets: [
                    { src: './dist/main.js', dest: dests },
                    { src: './manifest.json', dest: dests },
                    { src: './.hotreload', dest: dests },
                ],
                hook: 'writeBundle',
            }),
        ],
    };
});

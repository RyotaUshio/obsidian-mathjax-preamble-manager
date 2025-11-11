import { defineConfig } from 'rolldown';
import builtins from 'builtin-modules';
import copy from 'rollup-plugin-copy';
import * as fs from 'node:fs';
import * as path from 'node:path';
import 'dotenv/config';

const prod = process.env.NODE_ENV === 'production';

const vaults = process.env.VAULTS ? process.env.VAULTS.split(':') : [];
const pluginId = JSON.parse(fs.readFileSync('./manifest.json', 'utf-8')).id;
console.assert(typeof pluginId === 'string');
const destDirs = vaults.map(vault =>
    path.join(vault, '.obsidian/plugins', pluginId),
);

export default defineConfig({
    input: 'src/main.ts',
    output: {
        dir: 'dist',
        format: 'cjs',
        minify: prod,
        sourcemap: prod ? false : 'inline',
    },
    tsconfig: './tsconfig.json',
    platform: 'browser',
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
    plugins: [
        copy({
            targets: [
                { src: './dist/main.js', dest: destDirs },
                { src: './manifest.json', dest: destDirs },
                { src: './.hotreload', dest: destDirs },
            ],
            hook: 'writeBundle',
        }),
    ],
});

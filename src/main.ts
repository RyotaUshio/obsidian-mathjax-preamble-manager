import { Plugin } from 'obsidian';
import { getDefaultMathJaxConfig } from './getDefaultMathJaxConfig';
import { parseSettings } from './settings/settings';
import { initialize } from './orchestrate';

export default class MathJaxPreamblePlugin extends Plugin {
    async onload() {
        await getDefaultMathJaxConfig();
        const settings = parseSettings(await this.loadData());
        await this.saveData(settings);
        const cleanup = await initialize(settings);
        this.register(cleanup);
    }

    // async rerender() {
    //     this.manager.forgetHistory();

    //     for (const leaf of this.app.workspace.getLeavesOfType('markdown')) {
    //         const view = leaf.view as MarkdownView;
    //         const state = view.getState();
    //         const eState = view.getEphemeralState();
    //         view.previewMode.rerender(true);
    //         const editor = view.editor;
    //         editor.setValue(editor.getValue());
    //         if (state.mode === 'preview') {
    //             // Temporarily switch to Editing view and back to Reading view
    //             // to avoid Properties to be hidden
    //             state.mode = 'source';
    //             await view.setState(state, { history: false });
    //             state.mode = 'preview';
    //             await view.setState(state, { history: false });
    //         }
    //         view.setEphemeralState(eState);
    //     }
    // }
}

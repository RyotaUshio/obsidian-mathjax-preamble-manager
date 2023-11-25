import { MarkdownView, Plugin, loadMathJax } from 'obsidian';
import { MathJaxPreamblePluginSettingTab } from 'settings/settings';
import { patchMarkdownPreviewView } from 'patches/markdown-preview-view';
import { patchEditorView } from 'patches/editor-view';
import { PreambleManager, SerializedPreambles } from 'manager';


export default class MathJaxPreamblePlugin extends Plugin {
	manager: PreambleManager;

	async onload() {
		await loadMathJax();

		const data = await this.loadData() ?? {} as { preambles?: SerializedPreambles };
		const serializedPreambles = data['preambles'] || { preambles: [], folderPreambes: [] };

		this.addSettingTab(new MathJaxPreamblePluginSettingTab(this));

		this.addChild(this.manager = new PreambleManager(this, serializedPreambles));

		patchMarkdownPreviewView(this);
		patchEditorView(this);
	}

	async saveSettings() {
		await this.saveData({ preambles: this.manager.serialize() });
	}

	async rerender() {
		for (const leaf of this.app.workspace.getLeavesOfType('markdown')) {
			const view = leaf.view as MarkdownView;
			const state = view.getState();
			const eState = view.getEphemeralState();
			view.previewMode.rerender(true);
			const editor = view.editor;
			editor.setValue(editor.getValue());
			if (state.mode === 'preview') {
				// Temporarily switch to Editing view and back to Reading view
				// to avoid Properties to be hidden
				state.mode = 'source';
				await view.setState(state, { history: false });
				state.mode = 'preview';
				await view.setState(state, { history: false });
			}
			view.setEphemeralState(eState);
		}
	}
}

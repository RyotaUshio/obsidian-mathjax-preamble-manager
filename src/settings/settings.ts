import { PluginSettingTab, Setting } from 'obsidian';
import MyPlugin from 'main';
import { SerializedPreambles } from 'manager';
import { FileSuggest, FolderSuggest, PreambleSuggest } from './suggest';

export class MathJaxPreamblePluginSettingTab extends PluginSettingTab {
	serialized: SerializedPreambles | null;

	constructor(public plugin: MyPlugin) {
		super(plugin.app, plugin);
		this.serialized = null;
	}

	display(): void {
		this.serialized = this.plugin.manager.serialize();
		this._display(this.serialized)
	}

	_display(serialized: SerializedPreambles): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Register preambles')
			.setHeading()
			.addButton((button) => {
				button.setButtonText('Add')
					.setCta()
					.onClick(() => {
						serialized.preambles.push({ path: "" });
						this._display(serialized);
					});
			});

		let i = 1;
		for (const preamble of serialized.preambles) {
			new Setting(containerEl)
				.setName(`Preamble ${i}`)
				.addText((text) => {
					text.setPlaceholder('Path to preamble')
						.setValue(preamble.path)
						.then(text => new FileSuggest(this.plugin, text.inputEl)
							.onSelect(({ path }) => preamble.path = path)
						).onChange((path) => preamble.path = path);
				})
				.addExtraButton((button) => {
					button.setIcon('trash')
						.onClick(() => {
							const index = serialized.preambles.findIndex(({ path }) => path === preamble.path);
							serialized.preambles.splice(index, 1);
							this._display(serialized);
						});
				})
			i++;
		}



		new Setting(containerEl)
			.setName('Folder preambles')
			.setHeading()
			.addButton((button) => {
				button.setButtonText('Add')
					.setCta()
					.onClick(() => {
						serialized.folderPreambles.push({ folderPath: "", preamblePath: "" });
						this._display(serialized);
					});
			});

		i = 1;
		for (const folderPreamble of serialized.folderPreambles) {
			new Setting(containerEl)
				.setName(`Folder preamble ${i}`)
				.addText((text) => {
					text.setPlaceholder('Folder path')
						.setValue(folderPreamble.folderPath)
						.then(text => new FolderSuggest(this.plugin, text.inputEl)
							.onSelect(({ path }) => folderPreamble.folderPath = path)
						).onChange((path) => folderPreamble.folderPath = path);
				})
				.addText((text) => {
					const preamble = serialized.preambles.find(({ path }) => path === folderPreamble.preamblePath);
					text.setPlaceholder('Preamble path')
						.setValue(preamble?.path ?? '')
						.then(text => new PreambleSuggest(this.plugin, text.inputEl, serialized)
							.onSelect(({ path }) => {
								const preamble = serialized.preambles.find((p) => p.path === path);
								folderPreamble.preamblePath = preamble?.path ?? '';
							})
						).onChange((preamblePath) => {
							const preamble = serialized.preambles.find((p) => p.path === preamblePath);
							folderPreamble.preamblePath = preamble?.path ?? '';
						});
				})
				.addExtraButton((button) => {
					button.setIcon('trash')
						.onClick(() => {
							const index = serialized.folderPreambles.findIndex(({ folderPath }) => folderPath === folderPreamble.folderPath);
							serialized.folderPreambles.splice(index, 1);
							this._display(serialized);
						});
				})
			i++;
		}
	}

	async hide() {
		super.hide();
		if (this.serialized) await this.plugin.manager.deserialize(this.serialized);
		this.plugin.rerender();
		await this.plugin.saveSettings();
	}
}

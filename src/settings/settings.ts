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
						const id = "" + Date.now();
						serialized.preambles.push({ id, path: "" });
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
						);
				})
				.addExtraButton((button) => {
					button.setIcon('trash')
						.onClick(() => {
							const index = serialized.preambles.findIndex(({ id }) => id === preamble.id);
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
						serialized.folderPreambes.push({ folderPath: "", preambleId: "" });
						this._display(serialized);
					});
			});

		i = 1;
		for (const folderPreamble of serialized.folderPreambes) {
			new Setting(containerEl)
				.setName(`Folder preamble ${i}`)
				.addText((text) => {
					text.setPlaceholder('Folder path')
						.setValue(folderPreamble.folderPath)
						.then(text => new FolderSuggest(this.plugin, text.inputEl)
							.onSelect(({ path }) => folderPreamble.folderPath = path)
						);
				})
				.addText((text) => {
					const preamble = serialized.preambles.find(({ id }) => id === folderPreamble.preambleId);
					text.setPlaceholder('Preamble path')
						.setValue(preamble?.path ?? '')
						.then(text => new PreambleSuggest(this.plugin, text.inputEl, serialized)
							.onSelect(({ path }) => {
								const preamble = serialized.preambles.find((p) => p.path === path);
								folderPreamble.preambleId = preamble?.id ?? '';
							})
						);
				})
				.addExtraButton((button) => {
					button.setIcon('trash')
						.onClick(() => {
							const index = serialized.folderPreambes.findIndex(({ folderPath }) => folderPath === folderPreamble.folderPath);
							serialized.folderPreambes.splice(index, 1);
							this._display(serialized);
						});
				})
			i++;
		}
	}

	async hide() {
		if (this.serialized) await this.plugin.manager.deserialize(this.serialized);
		this.plugin.rerender();
		await this.plugin.saveSettings();
	}
}

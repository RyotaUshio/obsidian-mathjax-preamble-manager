import type MathJaxPreamblePlugin from '@/main';
import { ButtonComponent, Modal } from 'obsidian';

export function onMathJaxAlreadyLoaded(plugin: MathJaxPreamblePlugin) {
    const modal = new Modal(plugin.app);
    modal.setTitle('Welcome to ' + plugin.manifest.name);
    modal.contentEl.append(
        createDiv({}, el => {
            el.createEl('p', {
                text: 'To enable the plugin, please reload Obsidian.',
            });
        }),
        createDiv('modal-button-container', el => {
            new ButtonComponent(el)
                .setButtonText('Reload')
                .setCta()
                .onClick(() => {
                    window.location.reload();
                });
            new ButtonComponent(el).setButtonText('Later').onClick(() => {
                modal.close();
            });
        }),
    );
    modal.open();
}

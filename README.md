# MathJax Preamble Manager for Obsidian

This [Obsidian.md](https://obsidian.md) plugin lets you **use MathJax preambles** and **switch them based on note paths**.

- A preamble file can be any plain text file in your vault, including `.md`, `.sty`, `.tex`, and more.
- For each note, the preamble to be applied can be specified via either of the following ways:
  1. Folder preamble: Specify a preamble to be applied for all notes under a folder, similarly to [Templater](https://github.com/SilentVoid13/Templater)'s folder templates. If you want a preamble to apply to the entire vault, set it as a folder preamble for the vault root ("/").
  2. Properties (YAML front matter): Add a link (`[[...]]`) or a path (relative to the vault root) to your note as "preamble" property.
- Markdown code blocks (<code>``` ... ```</code>) and math blocks (`$$ ... $$`) will be automanically trimmed, so it's easy to edit preambles in Obsidian's markdown editor.
- When a preable file is modified, the changes will be immediately reflected to currently opened note. You don't need to reload the app to see the effect.

## Installation

Since this plugin is still in beta, it's not on the community plugin browser yet.

But you can install the latest beta release using [BRAT](https://github.com/TfTHacker/obsidian42-brat):

1.  Install BRAT and enable it.
2.  Go to `Options`. In the `Beta Plugin List` section, click on the `Add Beta plugin` button.
3.  Copy and paste `RyotaUshio/obsidian-mathjax-preamble` in the pop-up prompt and click on **Add Plugin**.
4.  _(Optional but highly recommended)_ Turn on `Auto-update plugins at startup` at the top of the page.
5.  Go to `Community plugins > Installed plugins`. You will find “MathJax Preamble Manager” in the list. Click on the toggle button to enable it.

## Support development

If you find this plugin useful, please support my work by buying me a coffee!

<a href="https://www.buymeacoffee.com/ryotaushio" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

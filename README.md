# MathJax Preamble Manager for Obsidian

This [Obsidian.md](https://obsidian.md) plugin lets you **use MathJax preambles** and **switch them based on note paths**.

- A preamble file can be any plain text file in your vault, including `.md`, `.sty`, `.tex`, and more.
- For each note, the preamble to be applied can be specified via either of the following ways:
  1. Folder preamble: Specify a preamble to be applied for all notes under a folder, similarly to [Templater](https://github.com/SilentVoid13/Templater)'s folder templates. If you want a preamble to apply to the entire vault, set it as a folder preamble for the vault root ("/").
  2. Properties (YAML front matter): Add a link (`[[...]]`) or a path (relative to the vault root) to a preamble as "preamble" property.
- Markdown code blocks (<code>``` ... ```</code>) and math blocks (`$$ ... $$`) will be automanically trimmed, so it's easy to edit preambles in Obsidian's markdown editor.
- When a preable file is modified, the changes will be immediately reflected to currently opened note. You don't need to reload the app to see the effect.

## Example

So suppose you want to use different probability symbol for different paths, say, 
- $\mathbb{P} \left( \cdots \right)$ for `Folder A`
- $\mathrm{Pr} \left[ \cdots \right]$ for `Note B`

### Writing preambles

Now you need to create two preamble files. Preambles can be any plain text files, but I recommend using markdown files because they can be easily edited from within Obsidian. In this example, the preamble for `Folder A` can be written in either of the following syntaxes:

- No formatting
  ```
  \newcommand{\P}[1]{\mathbb{P} \left( #1 \right)}
  ```

- Math block syntax
  ```
  $$
  \newcommand{\P}[1]{\mathbb{P} \left( #1 \right)}
  $$
  ```

- Inline math syntax
  ```
  $\newcommand{\P}[1]{\mathbb{P} \left( #1 \right)}$
  ```

- Code block syntax
  ````
  ```
  \newcommand{\P}[1]{\mathbb{P} \left( #1 \right)}
  ```
  ````

I recommend using either of the `$...$` or `$$...$$` syntaxes. See [here](#using-preambles-in-slides) for details.

So now, we have the following two preambles:

- `Preamble A.md`

  ```
  $$
  \newcommand{\P}[1]{\mathbb{P} \left( #1 \right)}
  $$
  ```


- `Preamble B.md`

  ```
  $$
  \newcommand{\P}[1]{\mathrm{Pr} \left[ #1 \right]}
  $$
  ```

### Registering preambles

Before being able to use the preambles, you need to register them in the plugin settings.

<img width="838" alt="image" src="https://github.com/RyotaUshio/obsidian-mathjax-preamble-manager/assets/72342591/71b871cc-7702-44aa-b5cf-40e6f43acf25">

### Folder preambles

Now, recall we wanted to apply `Preamble A.md` for all notes inside `Folder A`. This can be achieved by setting `Preamble A.md` as the _folder preamble_ for `Folder A`.

<img width="809" alt="image" src="https://github.com/RyotaUshio/obsidian-mathjax-preamble-manager/assets/72342591/7781a443-d872-4ce9-b326-0bc9be69fbfe">

### Specifying a preamble via `preamble` property

In order to apply a preamble to a single note (as opposed to an entire folder), you can add a link to the preamble as the `preamble` property of that note.

<img width="744" alt="image" src="https://github.com/RyotaUshio/obsidian-mathjax-preamble-manager/assets/72342591/097b841b-c05c-47a8-a2c0-14ead7302699">

### Results

<img width="466" alt="image" src="https://github.com/RyotaUshio/obsidian-mathjax-preamble-manager/assets/72342591/a5718bd0-d446-40b4-9fed-40c380796332">

<img width="469" alt="image" src="https://github.com/RyotaUshio/obsidian-mathjax-preamble-manager/assets/72342591/baafcbb5-09af-4d50-9283-93aafabb2d04">


### Using preambles in slides

This plugin supports the normal markdown views (Reading view/Live preview), embeds, hover page preview, PDF export and Canvas, but slides ([the core Slides plugin](https://help.obsidian.md/Plugins/Slides) and the [Advanced Slides](https://github.com/MSzturc/obsidian-advanced-slides) plugin) are not supported.

However, you can still manually load **markdown preambles with either of the `$...$` or `$$...$$` syntax** into your slides by embedding them. For this reason, I recommend using this preamble format.

```
![[preamble]]

Slide 1

---

Slide 2

---

...
```


## Installation

Since this plugin is still in beta, it's not on the community plugin browser yet.

But you can install the latest beta release using [BRAT](https://github.com/TfTHacker/obsidian42-brat):

1.  Install BRAT and enable it.
2.  Go to `Options`. In the `Beta Plugin List` section, click on the `Add Beta plugin` button.
3.  Copy and paste `RyotaUshio/obsidian-mathjax-preamble` in the pop-up prompt and click on **Add Plugin**.
4.  _(Optional but highly recommended)_ Turn on `Auto-update plugins at startup` at the top of the page.
5.  Go to `Community plugins > Installed plugins`. You will find “MathJax Preamble Manager” in the list. Click on the toggle button to enable it.

## Companion plugins

Here's a list of other math-related plugins I've developed:

- [Math Booster](https://github.com/RyotaUshio/obsidian-math-booster)
- [No More Flickering Inline Math](https://github.com/RyotaUshio/obsidian-inline-math)
- [Better Math in Callouts & Blockquotes](https://github.com/RyotaUshio/obsidian-math-in-callout)
- [Auto-\\displaystyle Inline Math](https://github.com/RyotaUshio/obsidian-auto-displaystyle-inline-math)

## Support development

If you find my plugins useful, please support my work by buying me a coffee!

<a href="https://www.buymeacoffee.com/ryotaushio" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

// Taken from Obsidian's app.js
export const DEFAULT_MATHJAX_CONFIG = {
    tex: {
        inlineMath: [],
        displayMath: [],
        processEscapes: false,
        processEnvironments: false,
        processRefs: false,
    },
    startup: {
        typeset: false
    },
    options: {
        enableMenu: false,
        menuOptions: {
            settings: {
                renderer: "CHTML"
            }
        },
        renderActions: {
            assistiveMml: []
        },
        safeOptions: {
            safeProtocols: {
                http: true,
                https: true,
                file: true,
                javascript: false,
                data: false
            }
        }
    }
}

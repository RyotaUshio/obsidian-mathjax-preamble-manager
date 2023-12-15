export function load(src: string, options?: { before?: () => void, after?: () => void }) {
    let loaded = false;
    let promise: Promise<void> | null = null;
    return {
        get loaded() {
            return loaded
        },
        get promise() {
            if (loaded)
                return Promise.resolve();
            if (!promise) {
                options?.before?.();
                const loadScriptPromise = new Promise<HTMLScriptElement>((resolve, reject) => {
                    const script = document.createElement("script");
                    script.type = "text/javascript",
                        script.src = src,
                        script.addEventListener("load", () => {
                            return resolve(script);
                        }),
                        script.addEventListener("error", (err) => {
                            return reject(err);
                        });
                        document.body.appendChild(script)
                });
                loadScriptPromise.catch((function (e) {
                    e.detach();
                    promise = null;
                }));
                promise = loadScriptPromise.then(() => {
                    loaded = true;
                    promise = null;
                    options?.after?.();
                });
            }
            return promise;
        },
        then: function (callback: () => any) {
            return loaded ? Promise.resolve(callback()) : this.promise.then(callback)
        }
    }
}
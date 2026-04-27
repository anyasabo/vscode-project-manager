declare module "walker" {
    interface Walker {
        filterDir(fn: (dir: string) => boolean): Walker;
        on(event: "dir" | "file" | "symlink", fn: (path: string) => void): Walker;
        on(event: "error", fn: (err: unknown) => void): Walker;
        on(event: "end", fn: () => void): Walker;
    }
    function walker(root: string): Walker;
    export = walker;
}

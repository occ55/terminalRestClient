declare module NodeJS {
  interface Global {
    Ex: import("../Explorer").Explorer,
    cd: (path: string) => void,
    ls: string, //(path?: string) => string[];
    $: import("../Explorer").ExplorerTree,
    $$: import("../Explorer").ExplorerTree,
    clear: () => void
  }
}

import * as path from "path";
import { existsSync, readdirSync, statSync } from "fs";

export const ExplorerTreeVal = Symbol("ExplorerTreeVal");

export interface ExplorerTree {
  [name: string]: ExplorerTree | string;

  [ExplorerTreeVal]: string;
}


export class Explorer {
  Path: string;
  Root: string;

  $: ExplorerTree;
  $$: ExplorerTree;

  BuildTree(cpath: string) {
    const tree: ExplorerTree = {
      [ExplorerTreeVal]: cpath,
    };
    const names = readdirSync(cpath);
    for (const name of names) {
      const newPath = path.join(cpath, name);
      if (statSync(newPath).isDirectory()) {
        tree[name] = this.BuildTree(newPath);
      } else {
        tree[name] = newPath;
      }
    }
    return tree;
  }

  FindInTree(searchPath: string, root: ExplorerTree): ExplorerTree | null {
    if (root[ExplorerTreeVal] === searchPath) {
      return root;
    }
    for (const name in root) {
      if (typeof root[name] !== "string") {
        const findResult = this.FindInTree(searchPath, root[name] as ExplorerTree);
        if (findResult !== null) {
          return findResult;
        }
      }
    }
    return null;
  }

  get ReadablePath() {
    return this.Path.replace(this.Root, "$");
  }

  private static SetToExplorerTree(Source: ExplorerTree, Dest: ExplorerTree) {
    Source[ExplorerTreeVal] = Dest[ExplorerTreeVal];
    for (const key in Source) {
      delete Source[key];
    }
    for (const key in Dest) {
      Source[key] = Dest[key];
    }
  }

  Navigate(add: string | ExplorerTree) {
    if (add === undefined) return;
    let CPath: string;
    if (typeof add !== "string") {
      CPath = add[ExplorerTreeVal];
      this.Path = CPath;
    } else {
      CPath = this.Path;
      CPath = path.join(CPath, add);
      if (!CPath.startsWith(this.Root)) {
        CPath = this.Root;
      }
      if (existsSync(CPath) && statSync(CPath).isDirectory()) {
        this.Path = CPath;
      } else {
        throw new Error("Directory does not exists");
      }
    }
    const foundTree = this.FindInTree(CPath, this.$) as ExplorerTree;
    Explorer.SetToExplorerTree(this.$$, foundTree);
    return CPath;
  }

  List(add?: string) {
    let cpath = this.Path;
    if (add) {
      cpath = path.resolve(cpath, add);
    }
    return readdirSync(cpath);
  }

  constructor(root: string, pathAdd?: string) {
    const absolute = path.resolve(root);
    this.Root = absolute;
    this.Path = absolute;
    if (pathAdd) {
      this.Navigate(pathAdd);
    }
    this.$ = this.BuildTree(this.Root);
    this.$$ = this.BuildTree(this.Root);
  }
}
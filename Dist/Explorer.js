"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs_1 = require("fs");
exports.ExplorerTreeVal = Symbol("ExplorerTreeVal");

class Explorer {
	BuildTree(cpath) {
		const tree = {
			[exports.ExplorerTreeVal]: cpath,
		};
		const names = fs_1.readdirSync(cpath);
		for (const name of names) {
			const newPath = path.join(cpath, name);
			if (fs_1.statSync(newPath).isDirectory()) {
				tree[name] = this.BuildTree(newPath);
			} else {
				tree[name] = newPath;
			}
		}
		return tree;
	}

	FindInTree(searchPath, root) {
		if (root[exports.ExplorerTreeVal] === searchPath) {
			return root;
		}
		for (const name in root) {
			if (typeof root[name] !== "string") {
				const findResult = this.FindInTree(searchPath, root[name]);
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

	static SetToExplorerTree(Source, Dest) {
		Source[exports.ExplorerTreeVal] = Dest[exports.ExplorerTreeVal];
		for (const key in Source) {
			delete Source[key];
		}
		for (const key in Dest) {
			Source[key] = Dest[key];
		}
	}

	Navigate(add) {
		if (add === undefined) {
			return;
		}
		let CPath;
		if (typeof add !== "string") {
			CPath = add[exports.ExplorerTreeVal];
			this.Path = CPath;
		} else {
			CPath = this.Path;
			CPath = path.join(CPath, add);
			if (!CPath.startsWith(this.Root)) {
				CPath = this.Root;
			}
			if (fs_1.existsSync(CPath) && fs_1.statSync(CPath).isDirectory()) {
				this.Path = CPath;
			} else {
				throw new Error("Directory does not exists");
			}
		}
		const foundTree = this.FindInTree(CPath, this.$);
		Explorer.SetToExplorerTree(this.$$, foundTree);
		return CPath;
	}

	List(add) {
		let cpath = this.Path;
		if (add) {
			cpath = path.resolve(cpath, add);
		}
		return fs_1.readdirSync(cpath);
	}

	constructor(root, pathAdd) {
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

exports.Explorer = Explorer;
//# sourceMappingURL=Explorer.js.map
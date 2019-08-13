"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const Require_1 = require("./Utils/Require");
const IdGen_1 = require("./Utils/IdGen");
var FileTypes;
(function(FileTypes) {
	FileTypes["js"] = "js";
	FileTypes["json"] = "json";
	FileTypes["binary"] = "binary";
	FileTypes["xml"] = "xml";
})(FileTypes = exports.FileTypes || (exports.FileTypes = {}));
exports.AcceptedResources = [
	"body",
	"context",
	"request",
	"header",
	"query",
];

/*
request id tasidigi icin requestin yeri ile ilgili islemlerde
tree nin degisimi onemli degil, gerektiginde lookup yapilir.

tree de degisim olursa context yenilenmeli
* */
class Tree {
	static CreateResource(fileName, filePath) {
		const parts = fileName.split(".");
		const ext = parts.pop() || "";
		const type = parts.pop() || "";
		let idendifier = parts.pop() || "default";
		if (idendifier === "def") {
			idendifier = "default";
		}
		const uniqueName = parts.join("");
		if (!(exports.AcceptedResources.includes(type))) {
			return;
		}
		const resource = {
			fileName: fileName,
			path: filePath,
			type: ext,
			resourceType: type,
			idendifier,
			uniqueName,
		};
		if (!(ext in FileTypes)) {
			resource.type = FileTypes.binary;
		}
		return resource;
	}

	static Find(fn, node = this.Root) {
		if (fn(node)) {
			return [node];
		} else {
			const arr = [];
			for (const child of node.children) {
				const result = this.Find(fn, child);
				if (result) {
					arr.push(...result);
				}
			}
			return arr;
		}
	}

	static FindFirstContext(identifier, node) {
		if (identifier in node.contextModuleMap) {
			return node.contextModuleMap[identifier];
		} else if (node.parent) {
			return this.FindFirstContext(identifier, node.parent);
		} else {
			return {};
		}
	}

	static async CreateNode(Path, Parent) {
		const node = {
			path: Path,
			parent: Parent,
			children: [],
			resources: {
				context: {},
				header: {},
				request: {},
				query: {},
				body: {},
			},
			contextModuleMap: {},
		};
		const fns = [];
		const files = fs_1.readdirSync(Path);
		for (const file of files) {
			const filePath = path_1.join(Path, file);
			if (fs_1.statSync(filePath).isDirectory()) {
				fns.push(async () => {
					const cnode = await this.CreateNode(filePath, node);
					node.children.push(cnode);
				});
			} else {
				const res = this.CreateResource(file, filePath);
				if (res) {
					if (!node.resources[res.resourceType]) {
						node.resources[res.resourceType] = {};
					}
					if (!node.resources[res.resourceType][res.idendifier]) {
						node.resources[res.resourceType][res.idendifier] = [];
					}
					node.resources[res.resourceType][res.idendifier].push(res);
				}
			}
		}
		for (const reqIdentifier in node.resources.request) {
			const resArr = node.resources.request[reqIdentifier];
			for (const res of resArr) {
				if (res.type === FileTypes.js && res.resourceType === "request") {
					let module = Require_1.reqUncached(res.path);
					if (!module.ID) {
						fs_1.appendFileSync(res.path, `\nmodule.exports.ID = "${IdGen_1.RequestIdGen()}";\n`);
						module = Require_1.reqUncached(res.path);
					}
					res.module = module;
				}
			}
		}
		//console.log(node.path);
		//context build
		if (this.ResExists(node, "context", "default")) {
			const parentC = this.FindFirstContext("default", node);
			const moduleObj = await this.MergeJsonResource(node, "context", "default", async (r) => {
				const module = Require_1.reqUncached(r.path);
				return typeof module === "function"
					? await module(parentC)
					: module;
			});
			node.contextModuleMap["default"] = Object.assign({}, parentC, moduleObj);
		}
		for (const cIdent in node.resources.context) {
			if (cIdent === "default") {
				continue;
			}
			const parentC = this.FindFirstContext(cIdent, node);
			const parentDefC = this.FindFirstContext("default", node);
			const moduleObj = await this.MergeJsonResource(node, "context", cIdent, async (r) => {
				const module = Require_1.reqUncached(r.path);
				return typeof module === "function"
					? await module(Object.assign({}, parentDefC, parentC))
					: module;
			});
			//console.log(parentDefC, parentC, currentContext);
			node.contextModuleMap[cIdent] = Object.assign({}, parentDefC, parentC, moduleObj);
		}
		this.AllNodes[node.path] = node;
		await Promise.all(fns.map(f => f()));
		return node;
	}

	static ResExists(node, resName, ident) {
		if (!node.resources[resName]) {
			return false;
		}
		if (!node.resources[resName][ident]) {
			return false;
		}
		return node.resources[resName][ident].length > 0;
	}

	static async MergeJsonResource(node, resName, ident, extractFn) {
		if (!node.resources[resName]) {
			return;
		}
		if (!node.resources[resName][ident]) {
			return;
		}
		const Arr = node.resources[resName][ident];
		const Obj = {};
		await Promise.all(Arr.map(async (r) => {
			return Object.assign(Obj, await extractFn(r));
		}));
		return Obj;
	}

	static async Build() {
		//wathcer i kapat
		this.Root = await this.CreateNode(global.Ex.Root);
		//watcher i ac
	}
}

Tree.AllNodes = {};
exports.Tree = Tree;
//# sourceMappingURL=Tree.js.map
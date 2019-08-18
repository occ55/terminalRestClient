"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Explorer_1 = require("Explorer");
const path_1 = require("path");
const Tree_1 = require("Tree");

async function Init() {
	InitExplorer();
	InitFlags();
	InitVariables();
	await InitTree();
}

exports.Init = Init;

async function InitTree() {
	await Tree_1.Tree.Build();
}

function InitVariables() {
	global.dateToString = (time) => {
		return time.toISOString();
	};
}

function InitFlags() {
	global.flags = {
		maxBodyToHoldInMemory: 1024 * 1024 * 100,
		saveToDisk: true,
	};
}

function InitExplorer() {
	global.Ex =
		new Explorer_1.Explorer(path_1.join("../", process.argv[2] || "Workspaces", process.argv[3] || "Test"));
	global.$ = global.Ex.$;
	global.$$ = global.Ex.$$;
	global.cd = global.Ex.Navigate.bind(global.Ex);
	//global.ls = global.Ex.List.bind(global.Ex);
	Object.defineProperty(global, "ls", {
		get: global.Ex.List.bind(global.Ex),
		enumerable: true,
		configurable: true,
	});
	global.clear = console.clear.bind(console);
}

//# sourceMappingURL=Init.js.map
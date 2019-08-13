"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Explorer_1 = require("./Explorer");
const path_1 = require("path");

async function InitGlobal() {
	InitExplorer();
}

exports.InitGlobal = InitGlobal;

function InitExplorer() {
	global.Ex = new Explorer_1.Explorer(path_1.join("../", process.argv[2] || "Workspaces", process.argv[3] || "Test"));
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

//# sourceMappingURL=Global.js.map
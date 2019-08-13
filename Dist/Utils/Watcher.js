"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Events_1 = require("./Events");
const chokidar = require("chokidar");

class Watcher {
	static Watch(name, fileName) {
		const watcher = chokidar.watch(fileName, {
			persistent: true,
			depth: 99,
		});
		this.Watchers[name] = watcher;
		watcher.on("add", console.log.bind(console));
		watcher.on("change", console.log.bind(console));
		watcher.on("unlink", console.log.bind(console));
		watcher.on("addDir", console.log.bind(console));
		watcher.on("all", console.log.bind(console));
		watcher.on("ready", console.log.bind(console));
	}
}

Watcher.$ = new Events_1.EventPoint();
Watcher.Watchers = {};
exports.Watcher = Watcher;
//# sourceMappingURL=Watcher.js.map
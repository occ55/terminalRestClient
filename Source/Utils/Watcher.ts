import { EventPoint } from "./Events";
import * as chokidar from "chokidar";
import { FSWatcher } from "chokidar";

export type fileWatcherEventTypes = "rename" | "change";

export class Watcher {
	static $ = new EventPoint<{ filename: string, event: fileWatcherEventTypes }>();
	static Watchers: Record<string, FSWatcher> = {};

	static Watch(name: string, fileName: string) {
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
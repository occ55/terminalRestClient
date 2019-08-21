declare module NodeJS {
	interface Global {
		Ex: import("../Explorer").Explorer,
		cd: (path: string) => void,
		ls: string, //(path?: string) => string[];
		$: import("../Explorer").ExplorerTree,
		$$: import("../Explorer").ExplorerTree,
		clear: () => void,
		helpers: {
			body: typeof import("../Helpers/Body").Body,
			stream: typeof import("../Helpers/Stream").Stream,
			cookie: typeof import("../Helpers/Cookie").Cookie
		},
		flags: {
			saveToDisk: boolean,
			maxBodyToHoldInMemory: number
		},
		dateToString: (time: Date) => string,
		send: (
			res: string | import("../Tree").INode,
			identifier?: string,
			preferedName?: string,
		) => Promise<any>
	}
}

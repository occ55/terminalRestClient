import { ExplorerTreeVal } from "./Explorer";
import { Protocols } from "./Request";
import { INode, IResource, Tree } from "./Tree";
import { IAnyRequest } from "./Types/RequestType";
import { reqUncached } from "./Utils/Require";

export class RequestBuilder {
	static async Build(
		source: string | INode,
		initialContext: any = {},
		fileName?: string,
	) {
		if ((source as any)[ExplorerTreeVal]) {
			source = (source as any)[ExplorerTreeVal];
		}
		if (typeof source === "string") {
			source = Tree.Find(n => n.path === source, Tree.Root)[0];
			if (!source) {
				throw new Error(`Cant form request, ${source}, ${fileName}`);
			}
		}
		let reqRes: IResource | undefined;
		const requests = Tree.ResourceArray(source, "request");
		if (fileName) {
			reqRes = requests.find(r => r.fileName === fileName);
		} else {
			reqRes = requests.find(r => r.idendifier === "default") || requests[0];
		}
		if (!reqRes) {
			throw new Error(`Cant form request with node, ${JSON.stringify(source.path)}, ${fileName}`);
		}
		const context = { ...source.context, ...initialContext };

		const req: IAnyRequest = await reqRes.module.Properties(context);
		const protocol = new Protocols[req.lib]();
		req.identifiers = req.identifiers || ["default", reqRes.idendifier];
		const hooks = await this.FindHooks(source, context, req);
		await protocol.Build(source, context, req, hooks, reqRes);
		return protocol;
	}

	private static async FindHooks(
		source: INode,
		context: any,
		req: IAnyRequest,
	) {
		const hooks = [];
		if ((req as any).hooks) {
			hooks.push((req as any).hooks);
		}
		for (const hookRes of Tree.ResourcesFrom(source, "hooks")) {
			if (req.identifiers!.includes(hookRes.idendifier)) {
				const hook = await reqUncached(hookRes.path)(context);
				if (this.ApplicableCompare(req.lib, hook.applicable)) {
					hooks.push(hook);
				}
			}
		}
		return hooks;
	}

	static ApplicableCompare(lib: string, applicable: string[]) {
		return applicable.reduce((acc, p) => {
			return acc || this.ProtocolCompare(lib, p);
		}, false);
	}

	static ProtocolCompare(p1: string, p2: string) {
		const ps1 = p1.split("-");
		const ps2 = p2.split("-");
		const maxLen = Math.max(ps1.length, ps2.length);
		for (let k = 0; k < maxLen; k++) {
			if (!(ps1[k] === "" || ps2[k] === "" || ps1[k] === ps2[k])) {
				return false;
			}
		}
		return true;
	}
}
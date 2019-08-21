import { HttpRequestBuilder } from "./HttpRequestBuilder";
import { INode, IResource, Tree } from "./Tree";
import { parse } from "url";
import { IAnyRequest, THttpRequest } from "./Types/RequestType";
import { Protocols, Request } from "./Request";
import { ExplorerTreeVal } from "./Explorer";

export class RequestBuilder {
	static async Build(
		source: string | INode,
		identifier?: string,
		name?: string,
	) {
		if ((source as any)[ExplorerTreeVal]) {
			source = (source as any)[ExplorerTreeVal];
		}
		if (typeof source === "string") {
			source = Tree.Find(n => n.path === source, Tree.Root)[0];
			if (!source) {
				throw new Error(`Cant form request, ${source}, ${identifier}`);
			}
		}
		if (Object.keys(source.resources.request).length === 0 ||
			(
				identifier
				&& !source.resources.request[identifier]
				&& !source.resources.request["default"])
		) {
			throw new Error(`Cant form request with node, ${JSON.stringify(source.path)}, ${identifier}`);
		}
		if (!identifier) {
			if (source.resources.request.default.length > 0) {
				identifier = "default";
			} else {
				identifier = Object.keys(source.resources.request).filter(key =>
					(source as INode).resources.request[key].length > 0)[0];
			}
		}
		const context = Tree.FindFirstContext(identifier, source);
		let reqRes: IResource;
		if (name) {
			reqRes =
				source.resources.request[identifier].find(
					r => r.uniqueName === name) as any;
		} else {
			reqRes = source.resources.request[identifier][0];
		}
		if (!reqRes) {
			throw new Error("Name not found");
		}
		const req: IAnyRequest = typeof reqRes.module.Properties === "function"
			? reqRes.module.Properties(context)
			: reqRes.module.Properties;
		let protocol: Request;
		if (req.lib.split("-").length > 1) {
			protocol = new Protocols[req.lib]();
		} else {
			const protocolName = req.protocol
				? req.protocol
				: parse(req.url || "").protocol!.replace(":", "");
			protocol = new Protocols[`${req.lib}-${protocolName}`]();
			req.lib = `${req.lib}-${protocolName}`;
		}
		const hooks = await this.FindHooks(source, identifier, context, req);
		await protocol.Build(source, identifier, context, req, name, hooks);
		return protocol;
	}

	private static async FindHooks(
		source: INode,
		identifier: string,
		context: any,
		req: IAnyRequest,
	) {
		const hooks = [];
		if ((req as any).hooks) {
			hooks.push((req as any).hooks);
		}
		for (let cNode = source; cNode != null; cNode = cNode.parent!) {
			const resObj = await Tree.MergeJsonResource(
				cNode,
				"hooks",
				identifier,
				async (r) => {
					return await HttpRequestBuilder.LoadResourceAsObject(context, req, r);
				},
			);
			let defResObj: undefined | any;
			if (identifier !== "default") {
				defResObj = await Tree.MergeJsonResource(
					cNode,
					"hooks",
					"default",
					async (r) => {
						return await HttpRequestBuilder.LoadResourceAsObject(
							context,
							req,
							r,
						);
					},
				);
			}
			if (resObj && this.ApplicableCompare(req.lib, resObj.applicable)) {
				hooks.push(resObj);
			}
			if (defResObj && this.ApplicableCompare(req.lib, defResObj.applicable)) {
				hooks.push(defResObj);
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
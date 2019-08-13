"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Tree_1 = require("./Tree");
const url_1 = require("url");
const Request_1 = require("./Request");

class RequestBuilder {
	static async Build(source, identifier, name) {
		if (typeof source === "string") {
			source = Tree_1.Tree.Find(n => n.path === source, Tree_1.Tree.Root)[0];
			if (!source) {
				throw new Error(`Cant form request, ${source}, ${identifier}`);
			}
		}
		if (Object.keys(source.resources.request).length === 0 ||
			(identifier
				&& !source.resources.request[identifier]
				&& !source.resources.request["default"])) {
			throw new Error(`Cant form request with node, ${JSON.stringify(source.path)}, ${identifier}`);
		}
		if (!identifier) {
			if (source.resources.request.default.length > 0) {
				identifier = "default";
			} else {
				identifier = Object.keys(source.resources.request).filter(key => source.resources.request[key].length > 0)[0];
			}
		}
		const context = Tree_1.Tree.FindFirstContext(identifier, source);
		let reqRes;
		if (name) {
			reqRes =
				source.resources.request[identifier].find(r => r.uniqueName === name);
		} else {
			reqRes = source.resources.request[identifier][0];
		}
		if (!reqRes) {
			throw new Error("Name not found");
		}
		const req = typeof reqRes.module.Properties === "function"
			? reqRes.module.Properties(context)
			: reqRes.module.Properties;
		let protocol;
		if (req.lib.split("-").length > 1) {
			protocol = new Request_1.Protocols[req.lib]();
		} else {
			const protocolName = req.protocol
				? req.protocol
				: url_1.parse(req.url || "").protocol.replace(":", "");
			protocol = new Request_1.Protocols[`${req.lib}-${protocolName}`]();
		}
		await protocol.Build(source, identifier, context, req, name);
		return protocol;
	}
}

exports.RequestBuilder = RequestBuilder;
//# sourceMappingURL=RequestBuilder.js.map
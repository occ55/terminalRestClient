"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Tree_1 = require("./Tree");
const Require_1 = require("./Utils/Require");
const FormData = require("form-data");

class HttpRequestBuilder {
	static async LoadResourceAsObject(context, req, resource) {
		if (!resource) {
			return {};
		}
		if (resource.type === Tree_1.FileTypes.js) {
			const moduleObj = Require_1.reqUncached(resource.path);
			if (typeof moduleObj === "function") {
				//normal function
				return await moduleObj(context, req) || {};
			} else if (typeof moduleObj.before === "function"
				|| typeof moduleObj.after === "function") {
				//before veya after i olan module
				if (typeof moduleObj.before === "function") {
					return await moduleObj.before(context, req) || {};
				} else {
					return {};
				}
			} else {
				//duz obje
				return moduleObj;
			}
		} else if (resource.type === Tree_1.FileTypes.json) {
			try {
				return require(resource.path);
			} catch (ex) {
				console.log(`invalid json at ${resource.path}`);
				return {};
			}
		} else {
			return {};
		}
	}

	static async LoadResourceAsObjectAfter(context, req, built, resource) {
		if (!resource) {
			return {};
		}
		if (resource.type === Tree_1.FileTypes.js) {
			const moduleObj = Require_1.reqUncached(resource.path);
			if (typeof moduleObj.before === "function" || typeof moduleObj.after
				=== "function") {
				//before veya after i olan module
				if (typeof moduleObj.after === "function") {
					return await moduleObj.after(context, req, built) || {};
				} else {
					return {};
				}
			} else {
				return {};
			}
		} else if (resource.type === Tree_1.FileTypes.json) {
			return {};
		} else {
			return {};
		}
	}

	static async BuildResources(source, identifier, name, context, req) {
		const result = {};
		const resToPush = [];
		if (req[name]) {
			resToPush.push(req[name]);
		}
		for (let cNode = source; cNode != null; cNode = cNode.parent) {
			const resObj = await Tree_1.Tree.MergeJsonResource(cNode, name, identifier, async (r) => {
				return await this.LoadResourceAsObject(context, req, r);
			});
			let defResObj;
			if (identifier !== "default") {
				defResObj = await Tree_1.Tree.MergeJsonResource(cNode, name, "default", async (r) => {
					return await this.LoadResourceAsObject(context, req, r);
				});
			}
			if (resObj) {
				resToPush.push(resObj);
			}
			if (defResObj) {
				resToPush.push(defResObj);
			}
		}
		Object.assign(result, ...resToPush.reverse());
		return result;
	}

	static async BuildResourcesAfter(source, identifier, name, context, req, built) {
		const result = {};
		const resToPush = [];
		for (let cNode = source; cNode != null; cNode = cNode.parent) {
			const resObj = await Tree_1.Tree.MergeJsonResource(cNode, name, identifier, async (r) => {
				return await this.LoadResourceAsObjectAfter(context, req, built, r);
			});
			let defResObj;
			if (identifier !== "default") {
				defResObj = await Tree_1.Tree.MergeJsonResource(cNode, name, "default", async (r) => {
					return await this.LoadResourceAsObjectAfter(context, req, built, r);
				});
			}
			if (resObj) {
				resToPush.push(resObj);
			}
			if (defResObj) {
				resToPush.push(defResObj);
			}
		}
		Object.assign(result, ...resToPush.reverse());
		return result;
	}

	static async BuildBody(source, identifier, bodyType, context, req, preferedName) {
		if (bodyType === "json" || bodyType === "urlencoded" ||
			bodyType === "multipart") {
			const obj = await this.BuildResources(source, identifier, "body", context, req);
			return {
				type: bodyType,
				value: obj,
			};
		}
		if (req.body) {
			return {
				type: bodyType,
				value: req.body,
			};
		}
		for (let cNode = source; cNode != null; cNode = cNode.parent) {
			const res = cNode.resources.body[identifier]
				.find(r => preferedName ? r.uniqueName === preferedName : true);
			let defRes;
			if (identifier !== "default") {
				defRes = cNode.resources.body.default
					.find(r => preferedName ? r.uniqueName === preferedName : true);
			}
			if (res) {
				return {
					type: bodyType,
					path: res.path,
				};
			} else if (defRes) {
				return {
					type: bodyType,
					path: defRes.path,
				};
			}
		}
		return {
			type: bodyType,
		};
	}

	static async BuildSanitized(source, identifier, context, req, preferedName) {
		let reqRes;
		if (source.resources.request[identifier].length > 0) {
			reqRes = source.resources.request[identifier]
				.find(r => preferedName ? r.uniqueName === preferedName : true);
		} else if (source.resources.request.default.length > 0) {
			reqRes = source.resources.request.default
				.find(r => preferedName ? r.uniqueName === preferedName : true);
		}
		if (!reqRes) {
			throw new Error("No request found");
		}
		const data = {};
		for (const rt of Tree_1.AcceptedResources) {
			if (rt === "request" || rt === "context") {
				continue;
			}
			if (rt === "body") {
				data[rt] =
					await this.BuildBody(source, identifier, req.bodyType, context, req, preferedName);
			} else {
				data[rt] =
					await this.BuildResources(source, identifier, rt, context, req);
			}
		}
		const built = {
			context,
			identifier,
			node: source,
			body: data.body,
			header: data.header,
			query: data.query,
			request: req,
			requestRes: reqRes,
			requestModule: reqRes.module,
		};
		if (req.sendBody && built.body && built.body.type === "multipart") {
			const form = new FormData();
			const body = built.body.value;
			for (const f in body) {
				if (body.hasOwnProperty(f)) {
					if (Array.isArray(body[f])) {
						body[f].forEach((el) => form.append(f, el));
					} else {
						form.append(f, body[f]);
					}
				}
			}
			built.body.form = form;
		}
		for (const rt of Tree_1.AcceptedResources) {
			if (rt === "request" || rt === "context" || rt === "body") {
				continue;
			}
			Object.assign(data[rt], await this.BuildResourcesAfter(source, identifier, rt, context, req, built));
		}
		return built;
	}
}

exports.HttpRequestBuilder = HttpRequestBuilder;
//# sourceMappingURL=HttpRequestBuilder.js.map
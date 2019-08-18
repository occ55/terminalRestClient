import { join } from "path";
import { AcceptedResources, FileTypes, INode, IResource, Tree } from "./Tree";
import { reqUncached } from "./Utils/Require";
import { IBuiltRequest, TBodyType, THttpRequest } from "./Types/RequestType";
import * as FormData from "form-data";

export class HttpRequestBuilder {
	private static async LoadResourceAsObject(
		context: any,
		req: THttpRequest,
		resource?: IResource,
	) {
		if (!resource) {
			return {};
		}
		if (resource.type === FileTypes.js) {
			const moduleObj = reqUncached(resource.path);
			if (typeof moduleObj === "function") {
				//normal function
				return await moduleObj(context, req) || {};
			} else if (typeof moduleObj.before === "function"
				|| typeof moduleObj.after === "function") {
				//before veya after i olan module
				if (typeof moduleObj.before === "function") {
					return await (moduleObj.before as any)(context, req) || {};
				} else {
					return {};
				}
			} else {
				//duz obje
				return moduleObj;
			}
		} else if (resource.type === FileTypes.json) {
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

	private static async LoadResourceAsObjectAfter(
		context: any,
		req: THttpRequest,
		built: IBuiltRequest,
		resource?: IResource,
	) {
		if (!resource) {
			return {};
		}
		if (resource.type === FileTypes.js) {
			const moduleObj = reqUncached(resource.path);
			if (typeof moduleObj.before === "function" || typeof moduleObj.after
				=== "function") {
				//before veya after i olan module
				if (typeof moduleObj.after === "function") {
					return await (moduleObj.after as any)(context, req, built) || {};
				} else {
					return {};
				}
			} else {
				return {};
			}
		} else if (resource.type === FileTypes.json) {
			return {};
		} else {
			return {};
		}
	}

	private static async BuildResources(
		source: INode,
		identifier: string,
		name: string,
		context: any,
		req: THttpRequest,
	) {
		const result = {};
		const resToPush: Record<string, any>[] = [];
		if ((req as any)[name]) {
			resToPush.push((req as any)[name]);
		}
		for (let cNode = source; cNode != null; cNode = cNode.parent!) {
			const resObj = await Tree.MergeJsonResource(
				cNode,
				name,
				identifier,
				async (r) => {
					return await this.LoadResourceAsObject(context, req, r);
				},
			);
			let defResObj: undefined | any;
			if (identifier !== "default") {
				defResObj = await Tree.MergeJsonResource(
					cNode,
					name,
					"default",
					async (r) => {
						return await this.LoadResourceAsObject(context, req, r);
					},
				);
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

	private static async BuildResourcesAfter(
		source: INode,
		identifier: string,
		name: string,
		context: any,
		req: THttpRequest,
		built: IBuiltRequest,
	) {
		const result = {};
		const resToPush: Record<string, any>[] = [];
		for (let cNode = source; cNode != null; cNode = cNode.parent!) {
			const resObj = await Tree.MergeJsonResource(
				cNode,
				name,
				identifier,
				async (r) => {
					return await this.LoadResourceAsObjectAfter(context, req, built, r);
				},
			);
			let defResObj: undefined | any;
			if (identifier !== "default") {
				defResObj = await Tree.MergeJsonResource(
					cNode,
					name,
					"default",
					async (r) => {
						return await this.LoadResourceAsObjectAfter(context, req, built, r);
					},
				);
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

	private static async BuildBody(
		source: INode,
		identifier: string,
		bodyType: TBodyType,
		context: any,
		req: THttpRequest,
		preferedName?: string,
	): Promise<{
		type: TBodyType,
		value?: string | Buffer | Record<any, string>,
		path?: string
	}> {
		if (bodyType === "json" || bodyType === "urlencoded" ||
			bodyType === "multipart") {
			const obj = await this.BuildResources(
				source,
				identifier,
				"body",
				context,
				req,
			);
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
		for (let cNode = source; cNode != null; cNode = cNode.parent!) {
			const res: undefined | IResource = cNode.resources.body[identifier]
				.find(r =>
					preferedName ? r.uniqueName === preferedName : true);
			let defRes: undefined | IResource;
			if (identifier !== "default") {
				defRes = cNode.resources.body.default
					.find(r =>
						preferedName ? r.uniqueName === preferedName : true);
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


	public static async BuildSanitized(
		source: INode,
		identifier: string,
		context: any,
		req: THttpRequest,
		preferedName?: string,
	) {
		let reqRes: IResource | undefined;
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
		const data: Record<string, Record<string, any>> = {} as any;
		for (const rt of AcceptedResources) {
			if (rt === "request" || rt === "context") {
				continue;
			}
			if (rt === "body") {
				data[rt] =
					await this.BuildBody(
						source,
						identifier,
						req.bodyType,
						context,
						req,
						preferedName,
					);
			} else {
				data[rt] =
					await this.BuildResources(
						source,
						identifier,
						rt,
						context,
						req,
					);
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
			directory: join(reqRes.path, ".."),
		} as IBuiltRequest;
		if (req.sendBody && built.body && built.body.type === "multipart") {
			const form = new FormData();
			const body = built.body.value as Record<string, any>;
			for (const f in body) {
				if (body.hasOwnProperty(f)) {
					if (Array.isArray(body[f])) {
						body[f].forEach((el: any) => form.append(f, el));
					} else {
						form.append(f, body[f]);
					}
				}
			}
			built.body.form = form;
		}
		for (const rt of AcceptedResources) {
			if (rt === "request" || rt === "context" || rt === "body") {
				continue;
			}
			Object.assign(
				data[rt],
				await this.BuildResourcesAfter(
					source,
					identifier,
					rt,
					context,
					req,
					built,
				),
			);
		}
		return built;
	}
}
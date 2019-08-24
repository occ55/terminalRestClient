import { join } from "path";
import { FileStruct } from "./Helpers/Body";
import { AcceptedResources, INode, IResource, Tree } from "./Tree";
import { IBuiltRequest, IHttpRequest, TBodyType } from "./Types/RequestType";
import { reqUncached } from "./Utils/Require";

const FormData = require("form-data");

export class HttpRequestBuilder {

	static async ResourceMiddleware(
		source: INode,
		resourceName: string,
		context: any,
		req: IHttpRequest,
		after?: boolean,
		built?: IBuiltRequest,
	) {
		let result = after ?
			(built! as any)[resourceName]
			: ((req as any)[resourceName] ? (req as any)[resourceName] : {});

		for (const res of Tree.ResourcesTo(source, resourceName)) {
			if (!req.identifiers!.includes(res.idendifier)) {
				continue;
			}
			const module = reqUncached(res.path);
			if (typeof module.after === "function"
				|| typeof module.before === "function") {
				const fn = after ? "after" : "before";
				if (!(fn in module)) {
					continue;
				}
				const moduleResult = await module[fn]({
					context,
					req,
					previous: result,
					built: built,
				});
				if (moduleResult) {
					result = moduleResult;
				}
			} else if (!after) {
				const moduleResult = await module({
					context,
					req,
					previous: result,
				});
				if (moduleResult) {
					result = moduleResult;
				}
			}
		}
		return result;
	}

	private static async BuildBody(
		source: INode,
		bodyType: TBodyType,
		context: any,
		req: IHttpRequest,
	): Promise<{
		type: TBodyType,
		value?: string | Buffer | Record<any, string>,
		path?: string
	}> {
		let bodyInit: any;
		if (req.body) {
			if (req.body instanceof FileStruct) {
				return {
					type: bodyType,
					path: req.body.path,
				};
			} else if (typeof req.body === "object") {
				bodyInit = { ...req.body };
			} else {
				return {
					type: bodyType,
					value: req.body,
				};
			}
		} else {
			bodyInit = {};
		}
		for (const res of Tree.ResourcesTo(source, "body")) {
			if (!req.identifiers!.includes(res.idendifier)) {
				continue;
			}
			const module: { before?: Function, after?: Function } | Function
				= reqUncached(res.path);
			if (typeof module !== "function") {
				if (!module.before) {
					continue;
				}
				const moduleResult = await module.before({
					context,
					req,
					previous: bodyInit,
				});
				if (moduleResult) {
					bodyInit = moduleResult;
				}
			} else {
				const moduleResult = await module({
					context,
					req,
					previous: bodyInit,
				});
				if (moduleResult) {
					bodyInit = moduleResult;
				}
			}
		}
		return {
			type: bodyType,
			value: bodyInit,
		};
	}


	public static async BuildSanitized(
		source: INode,
		context: any,
		req: IHttpRequest,
		reqRes: IResource,
	) {
		const data: Record<string, Record<string, any>> = {} as any;
		for (const rt of AcceptedResources) {
			if (rt === "request" || rt === "context") {
				continue;
			}
			if (rt === "body") {
				if (req.sendBody) {
					data[rt] =
						await this.BuildBody(
							source,
							req.bodyType,
							context,
							req,
						);
				}
			} else {
				data[rt] =
					await this.ResourceMiddleware(
						source,
						rt,
						context,
						req,
					);
			}
		}
		const built = {
			context,
			node: source,
			body: data.body,
			headers: data.headers,
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
				await this.ResourceMiddleware(
					source,
					rt,
					context,
					req,
					true,
					built,
				),
			);
		}
		return built;
	}
}
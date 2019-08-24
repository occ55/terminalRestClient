import * as httpLib from "http";
import * as qs from "querystring";
import { parse, URLSearchParams, UrlWithStringQuery } from "url";
import { Body } from "../../Helpers/Body";
import { HttpRequestBuilder } from "../../HttpRequestBuilder";
import { Protocols, Request } from "../../Request";
import { HttpResults } from "../../Results/node/HttpResults";
import { INode, IResource } from "../../Tree";
import { IBuiltRequest, IHttpRequest } from "../../Types/RequestType";

export class http extends Request {

	Data: IBuiltRequest = {} as any;

	async Build(
		source: INode,
		context: any,
		req: IHttpRequest,
		hooks: any[] = [],
		reqResource: IResource,
	) {
		super.Build(source, context, req, hooks, reqResource);
		let urlData: UrlWithStringQuery = {} as any;
		if (req.url) {
			urlData = parse(req.url);
		}
		const fullPath = req.path || urlData.path || "";
		const [pathName] = fullPath.split("?");
		req = {
			...req,
			host: req.host || urlData.hostname,
			port: req.port || parseInt(urlData.port || "80"),
			path: pathName,
			protocol: req.protocol || "http",
		} as IHttpRequest;
		const data = await HttpRequestBuilder.BuildSanitized(
			source,
			context,
			req,
			reqResource,
		);
		this.Data = data;
		this.Hooks = hooks;
		return data;
	}

	Send(interactive: boolean = false): Promise<HttpResults> {
		return new Promise(async (mainRes, mainRej) => {
			let requestP: Promise<httpLib.IncomingMessage>;
			let urlData: UrlWithStringQuery = {} as any;
			if (this.Data.request.url) {
				urlData = parse(this.Data.request.url);
			}
			let requestRes = () => {
			};
			requestP = new Promise<httpLib.IncomingMessage>((res) => {
				requestRes = res;
			});
			const fullPath = this.Data.request.path || urlData.path || "";
			const [pathName, pathQuery] = fullPath.split("?");
			const queryParams = new URLSearchParams(
				{
					...this.Data.query as any,
					...qs.parse(urlData.query || ""),
					...qs.parse(pathQuery),
				}).toString();
			const sentReqArgs: httpLib.RequestOptions = {
				headers: this.Data.headers,
				hostname: this.Data.request.host || urlData.hostname,
				method: this.Data.request.method,
				port: this.Data.request.port || urlData.port,
				path: pathName +
					(queryParams.length > 0 ? `?${queryParams}` : ""),
			};
			const clientReq = httpLib.request(sentReqArgs, requestRes);
			const startTime = new Date;
			if (this.Data.request.sendBody) {
				const stream = await Body.value(this.Data.body);
				stream.pipe(clientReq);
			} else {
				clientReq.end();
			}
			const results = new HttpResults(
				clientReq,
				requestP,
				this.Data,
				startTime,
				this,
			);
			results.sentRequestOptions = sentReqArgs;
			results.on("error", ex => {
				mainRej(ex);
			});
			mainRes(results);
			await results.Prepare();
		});
	}
}

Protocols["node-http"] = http;
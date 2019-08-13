import { HttpRequestBuilder } from "HttpRequestBuilder";
import * as httpLib from "http";
import { parse, URLSearchParams, UrlWithStringQuery } from "url";
import { Body } from "../../Helpers/Body";
import * as qs from "querystring";
import { INode } from "../../Tree";
import { IBuiltRequest, THttpRequest } from "../../Types/RequestType";
import { Protocols, Request } from "../../Request";

export class http extends Request {

	Data: IBuiltRequest = {} as any;

	async Build(
		source: INode,
		identifier: string,
		context: any,
		req: THttpRequest,
		preferedName?: string,
	) {
		super.Build(source, identifier, context, req, preferedName);
		const data = await HttpRequestBuilder.BuildSanitized(
			source,
			identifier,
			context,
			req,
			preferedName,
		);
		this.Data = data;
		return data;
	}

	Send(interactive: boolean = false) {
		return new Promise(async (mainRes, mainRej) => {
			let urlData: UrlWithStringQuery = {} as any;
			if (this.Data.request.url) {
				urlData = parse(this.Data.request.url);
			}
			let requestRes = () => {};
			const requestP = new Promise<httpLib.IncomingMessage>((res) => {
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
			console.log(queryParams);
			const clientReq = httpLib.request({
				headers: this.Data.header,
				hostname: this.Data.request.host || urlData.hostname,
				method: this.Data.request.method,
				port: this.Data.request.port || urlData.port,
				path: pathName +
					(queryParams.length > 0 ? `?${queryParams}` : ""),
			}, requestRes);
			clientReq.on("error", (ex) => {
				mainRej(ex);
			});
			if (this.Data.request.sendBody) {
				const stream = Body.value(this.Data.body);
				stream.pipe(clientReq);
			} else {
				clientReq.end();
			}
			const res = await requestP;
			console.log(res.statusCode);
			const chunks: Buffer[] = [];
			res.on("data", function(chunk) {
				chunks.push(chunk);
			});
			res.on("end", function() {
				const body = Buffer.concat(chunks);
				mainRes(body);
				console.log(body.toString());
			});
			res.on("error", (ex) => {
				mainRej(ex);
			});
		});
	}
}

Protocols["node-http"] = http;
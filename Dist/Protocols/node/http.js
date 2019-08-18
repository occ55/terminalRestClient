"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HttpRequestBuilder_1 = require("HttpRequestBuilder");
const httpLib = require("http");
const HttpResults_1 = require("Results/node/HttpResults");
const url_1 = require("url");
const Body_1 = require("Helpers/Body");
const qs = require("querystring");
const Request_1 = require("Request");

class http extends Request_1.Request {
	constructor() {
		super(...arguments);
		this.Data = {};
	}

	async Build(source, identifier, context, req, preferedName) {
		super.Build(source, identifier, context, req, preferedName);
		const data = await HttpRequestBuilder_1.HttpRequestBuilder.BuildSanitized(source, identifier, context, req, preferedName);
		this.Data = data;
		return data;
	}

	Send(interactive = false) {
		return new Promise(async (mainRes, mainRej) => {
			let requestP;
			let urlData = {};
			if (this.Data.request.url) {
				urlData = url_1.parse(this.Data.request.url);
			}
			let requestRes = () => {
			};
			requestP = new Promise((res) => {
				requestRes = res;
			});
			const fullPath = this.Data.request.path || urlData.path || "";
			const [pathName, pathQuery] = fullPath.split("?");
			const queryParams = new url_1.URLSearchParams(Object.assign({}, this.Data.query, qs.parse(urlData.query || ""), qs.parse(pathQuery))).toString();
			const sentReqArgs = {
				headers: this.Data.header,
				hostname: this.Data.request.host || urlData.hostname,
				method: this.Data.request.method,
				port: this.Data.request.port || urlData.port,
				path: pathName +
					(queryParams.length > 0 ? `?${queryParams}` : ""),
			};
			const clientReq = httpLib.request(sentReqArgs, requestRes);
			const startTime = new Date;
			if (this.Data.request.sendBody) {
				const stream = Body_1.Body.value(this.Data.body);
				stream.pipe(clientReq);
			} else {
				clientReq.end();
			}
			const results = new HttpResults_1.HttpResults(clientReq, requestP, this.Data, startTime);
			results.sentRequestOptions = sentReqArgs;
			results.on("error", ex => {
				mainRej(ex);
			});
			mainRes(results);
			await results.Prepare();
		});
	}
}

exports.http = http;
Request_1.Protocols["node-http"] = http;
//# sourceMappingURL=http.js.map
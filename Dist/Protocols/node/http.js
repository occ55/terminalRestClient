"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HttpRequestBuilder_1 = require("HttpRequestBuilder");
const httpLib = require("http");
const url_1 = require("url");
const Body_1 = require("../../Helpers/Body");
const qs = require("querystring");
const Request_1 = require("../../Request");

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
			let urlData = {};
			if (this.Data.request.url) {
				urlData = url_1.parse(this.Data.request.url);
			}
			let requestRes = () => {
			};
			const requestP = new Promise((res) => {
				requestRes = res;
			});
			const fullPath = this.Data.request.path || urlData.path || "";
			const [pathName, pathQuery] = fullPath.split("?");
			const queryParams = new url_1.URLSearchParams(Object.assign({}, this.Data.query, qs.parse(urlData.query || ""), qs.parse(pathQuery))).toString();
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
				const stream = Body_1.Body.value(this.Data.body);
				stream.pipe(clientReq);
			} else {
				clientReq.end();
			}
			const res = await requestP;
			console.log(res.statusCode);
			const chunks = [];
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

exports.http = http;
Request_1.Protocols["node-http"] = http;
//# sourceMappingURL=http.js.map
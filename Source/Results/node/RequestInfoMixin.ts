import * as httpLib from "http";
import { parse } from "url";
import { http } from "../../Protocols/node/http";
import { IBuiltRequest } from "../../Types/RequestType";
import { ParseDomain } from "../../Utils/Domain";

export class RequestInfoMixin {
	clientRequest!: httpLib.ClientRequest;
	builtRequest!: IBuiltRequest;
	httpRequestParent!: http;
	sentRequestOptions!: httpLib.RequestOptions;

	get hostname() {
		return this.sentRequestOptions.hostname
			|| this.builtRequest.request.hostname;
	}

	get method() {
		return this.sentRequestOptions.method!;
	}

	get pathname() {
		return this.sentRequestOptions.path!.split("?")[0];
	}

	get port() {
		return this.sentRequestOptions.port!;
	}

	get host() {
		return `${this.hostname}:${this.port}`;
	}

	get domain() {
		return ParseDomain(this.hostname);
	}

}
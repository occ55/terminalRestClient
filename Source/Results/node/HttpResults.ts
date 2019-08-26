import { EventEmitter } from "events";
import { writeFileSync } from "fs";
import * as httpLib from "http";
import * as mime from "mime-types";
import { join } from "path";
import { format, parse } from "url";
import { inspect } from "util";
import { http } from "../../Protocols/node/http";
import { IBuiltRequest } from "../../Types/RequestType";
import { applyMixins } from "../../Utils/Mixin";
import { BodyMixin } from "./BodyMixin";
import { OutputHandlingMixin } from "./OutputHandlingMixin";
import { RequestInfoMixin } from "./RequestInfoMixin";


export class HttpResults extends EventEmitter {
	rawBody?: Buffer;
	_completeResolve: Function = null as any;
	complete: Promise<any> = new Promise(
		res => this._completeResolve = res,
	);
	_endedResolve: Function = null as any;
	ended: Promise<any> = new Promise(
		res => this._endedResolve = res,
	);
	isCompleted = false;
	endTime?: Date;
	responseFolder: string = "";

	constructor(
		public clientRequest: httpLib.ClientRequest,
		public response: httpLib.IncomingMessage | Promise<httpLib.IncomingMessage>,
		public builtRequest: IBuiltRequest,
		public startTime: Date = new Date,
		public httpRequestParent: http,
		public sentRequestOptions: httpLib.RequestOptions,
	) {
		super();
		console.log(
			sentRequestOptions,
			parse("http://onurcan:123@localhost:3000/get?a=1"),
		);
	}


	toJSON() {
		if (this.response instanceof Promise) {
			throw new Error("Response not completed");
		}
		const timePassed = this.endTime ?
			this.endTime.getTime() - this.startTime.getTime()
			: 0;
		const bodyLength = this.rawBody ? this.rawBody.length : 0;
		return {
			status: this.response.statusCode,
			url: this.sentRequestOptions
				? `${format(this.sentRequestOptions)}${this.sentRequestOptions.path}`
				: null,
			method: this.sentRequestOptions ? this.sentRequestOptions.method : null,
			timePassed: `${(timePassed / 1000).toFixed(2)}s`,
			timePassedMs: timePassed,
			bodyLength,
			bodyLengthMb: `${(bodyLength / (1024 * 1024)).toFixed(2)} MB`,
			sentHeaders: this.sentHeaders,
			responseHeaders: this.headers,
		};
	}

	SaveDetailsToDisk() {
		writeFileSync(
			join(this.responseFolder, "details.json"),
			JSON.stringify(this.toJSON(), null, "\t"),
		);
	}

	get sentHeaders() {
		return this.clientRequest.getHeaders();
	}

	get headers() {
		if (this.response instanceof Promise) {
			throw new Error("Response not completed");
		} else {
			return this.response.headers;
		}
	}


	async Init() {
		await this.PreperaOutputFolder();
		this.clientRequest.on("error", (ex) => {
			this.emit("error", ex);
		});
		this.response = await this.response;
		this.response.on("error", (ex) => {
			this.emit("error", ex);
		});
		if (global.flags.saveToDisk) {
			await this.HandleOutput(this.responseFolder);
		} else {
			await this.HandleOutputNonWrite();
		}
		await this.ended;
		this.endTime = new Date;
		this.SaveDetailsToDisk();
		await this.ParseOutput();
		const parentData = this.httpRequestParent.Data;
		for (const hooksObj of this.httpRequestParent.Hooks) {
			if (typeof hooksObj.afterComplete === "function") {
				await hooksObj.afterComplete({
					context: parentData.context,
					req: parentData.request,
					built: parentData,
					result: this,
				});
			}
		}
		this._completeResolve(this.rawBody);
	}


	get extensionOfResponse() {
		if (this.response instanceof Promise) {
			return "";
		}
		return mime.extension(
			`${this.response.headers["content-type"]
			|| this.response.headers["Content-Type"]
			|| "application/octet-stream"}`,
			)
			|| "bin";
	}


}

export interface HttpResults extends BodyMixin,
	OutputHandlingMixin,
	RequestInfoMixin {}

applyMixins(HttpResults, [BodyMixin, OutputHandlingMixin, RequestInfoMixin]);
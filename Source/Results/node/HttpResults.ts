import { EventEmitter } from "events";
import {
	appendFileSync,
	createWriteStream,
	existsSync,
	readFileSync,
	statSync,
	symlinkSync,
	unlinkSync,
	writeFileSync,
} from "fs";
import * as httpLib from "http";
import * as jsdom from "jsdom";
import * as mime from "mime-types";
import * as mkdirp from "mkdirp";
import { join } from "path";
import { format } from "url";
import * as xmlParser from "xml-parser";
import { http } from "../../Protocols/node/http";
import { IBuiltRequest } from "../../Types/RequestType";

export class HttpResults extends EventEmitter {
	clientRequest: httpLib.ClientRequest;
	response: httpLib.IncomingMessage | Promise<httpLib.IncomingMessage>;
	builtRequest: IBuiltRequest;
	sentRequestOptions?: httpLib.RequestOptions;
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
	jsonBody?: any;
	textBody?: string;
	htmlBody?: jsdom.JSDOM;
	xmlBody?: xmlParser.Document;
	startTime: Date;
	endTime?: Date;
	responseFolder: string = "";
	httpRequestParent: http;


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
			responseHeaders: this.responseHeaders,
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

	get responseHeaders() {
		if (this.response instanceof Promise) {
			throw new Error("Response not completed");
		} else {
			return this.response.headers;
		}
	}

	get outDir() {
		const outPath = join(this.builtRequest.directory, "./Out");
		if (!existsSync(outPath)) {
			mkdirp.sync(outPath);
		}
		return outPath;
	}

	get body() {
		return this.complete.then(() => {
			return this.jsonBody
				|| this.htmlBody
				|| this.xmlBody
				|| this.textBody
				|| this.rawBody;
		});
	}

	async Prepare() {
		this.responseFolder = join(this.outDir, global.dateToString(new Date));
		if (global.flags.saveToDisk) {
			mkdirp.sync(this.responseFolder);
			if (process.platform !== "win32") {
				const latestPath = join(this.outDir, "0-latest");
				if (existsSync(latestPath)) {
					unlinkSync(latestPath);
				}
				symlinkSync(this.responseFolder, latestPath);
			}
			this.on("error", (ex) => {
				appendFileSync(
					join(this.responseFolder, "error.json"),
					JSON.stringify(ex, Object.getOwnPropertyNames(ex)),
				);
				console.log("error written");
			});
		}
		this.clientRequest.on("error", (ex) => {
			console.log("clientReqError");
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
		for (const hooksObj of this.httpRequestParent.Hooks) {
			if (typeof hooksObj.afterComplete === "function") {
				await hooksObj.afterComplete(
					this.httpRequestParent.Data.context,
					this.httpRequestParent.Data.request,
					this.httpRequestParent.Data,
					this,
				);
			}
		}
		this._completeResolve(this.rawBody);
	}

	async ParseOutput() {
		if (!this.rawBody || this.response instanceof Promise) {
			return;
		}
		const ext = this.extensionOfResponse;
		switch (ext) {
			case "txt":
				this.textBody = this.rawBody.toString();
				break;
			case "json":
				this.jsonBody = JSON.parse(this.rawBody.toString());
				break;
			case "html":
				this.htmlBody = new jsdom.JSDOM(this.rawBody);
				break;
			case "xml":
				this.xmlBody = xmlParser(this.rawBody.toString());
				break;
		}
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

	async HandleOutput(responseFolder: string) {
		this.response = await this.response;
		const responseBodyFile = join(
			responseFolder,
			`./result.${this.extensionOfResponse}`,
		);
		const writeStream = createWriteStream(responseBodyFile);
		this.response.pipe(writeStream);
		writeStream.on("close", () => {
			if (statSync(responseBodyFile).size
				<= global.flags.maxBodyToHoldInMemory) {
				this.rawBody = readFileSync(responseBodyFile);
			}
			this.isCompleted = true;
			this._endedResolve(this.rawBody);
		});
	}

	async HandleOutputNonWrite() {
		this.response = await this.response;
		const chunks: Buffer[] = [];
		this.response.on("data", chunk => {
			chunks.push(chunk);
		});
		this.response.on("end", () => {
			this.rawBody = Buffer.concat(chunks);
			this.isCompleted = true;
			this._endedResolve(this.rawBody);
		});
	}

	constructor(
		req: httpLib.ClientRequest,
		res: httpLib.IncomingMessage | Promise<httpLib.IncomingMessage>,
		builtRequest: IBuiltRequest,
		startTime: Date = new Date,
		parent: http,
	) {
		super();
		this.clientRequest = req;
		this.response = res;
		this.builtRequest = builtRequest;
		this.startTime = startTime;
		this.httpRequestParent = parent;
	}
}
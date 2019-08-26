import * as fileType from "file-type";
// tslint:disable-next-line:no-duplicate-imports
import * as fs from "fs";
import { ReadStream } from "fs";
import { URLSearchParams } from "url";
import { IBody } from "../Types/RequestType";
import { Stream } from "./Stream";

const streamLength = require("stream-length");

export class FileStruct {
	constructor(public path: string) {

	}
}

export class Body {
	static async size(body: IBody) {
		const value = body.value;
		if (value) {
			if (typeof value === "string") {
				return Buffer.byteLength(value);
			} else if (Buffer.isBuffer(value)) {
				return value.length;
			} else if (value instanceof ReadStream) {
				return await streamLength(value);
			} else if (body.type === "json") {
				return Buffer.byteLength(JSON.stringify(value));
			} else if (body.type === "urlencoded") {
				const val = new URLSearchParams(value);
				return Buffer.byteLength(val.toString());
			} else if (body.type === "multipart" && body.form) {
				return body.form.getLengthSync();
			}
		}
		return body.path ? fs.statSync(body.path).size : 0;
	}

	static async value(body: IBody) {
		const value = body.value;
		if (value) {
			if (typeof value === "string" || Buffer.isBuffer(value)) {
				return Stream.from(value);
			} else if (value instanceof ReadStream) {
				return value;
			} else if (body.type === "json") {
				return Stream.from(JSON.stringify(value));
			} else if (body.type === "urlencoded") {
				const val = new URLSearchParams(value);
				return Stream.from(val.toString());
			} else if (body.type === "multipart" && body.form) {
				return body.form;
			}
			return Stream.from("");
		} else if (body.path) {
			return fs.createReadStream(body.path);
		} else {
			console.trace("no path and value");
			return Stream.from("");
		}
	}

	static async type(body: IBody) {
		if (body.type) {
			if (body.type === "json") {
				return "application/json";
			} else if (body.type === "urlencoded") {
				return "application/x-www-form-urlencoded";
			} else if (body.type === "multipart") {
				return "multipart/form-data";
			} else if (body.type === "xml") {
				return "application/xml";
			} else if (body.type === "binary") {
				const fileStream = await Body.value(body);
				const stream = await fileType.stream(fileStream);
				return stream.fileType
					? stream.fileType.mime
					: "application/octet-stream";
			}
		}
		return "application/octet-stream";
	}

	static file(path: string) {
		return new FileStruct(path);
	}
}

global.helpers.Body = Body;

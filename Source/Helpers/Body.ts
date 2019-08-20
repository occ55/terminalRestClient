import { IBody } from "Types/RequestType";
import * as fs from "fs";
import { Stream } from "./Stream";
import { URLSearchParams } from "url";
import { contentType } from "mime-types";
import { Readable } from "stream";
// tslint:disable-next-line:no-duplicate-imports
import { ReadStream } from "fs";

const streamLength = require("stream-length");

const fileType = require("file-type");

export class Body {
	static async size(body: IBody) {
		let value = body.value;
		if (body.value && typeof body.value === "function") {
			value = await body.value();
		}
		if (value && typeof value !== "function") {
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
		let value = body.value;
		if (body.value && typeof body.value === "function") {
			value = await body.value();
		}
		if (value && typeof value !== "function") {
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
				return stream.fileType ? stream.fileType.mime : "application/octet-stream";
			}
		}
		return "application/octet-stream";
	}
}

global.helpers.body = Body;

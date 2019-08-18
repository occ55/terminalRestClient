import { IBody } from "Types/RequestType";
import * as fs from "fs";
import { Stream } from "./Stream";
import { URLSearchParams } from "url";

export class Body {
	static size(body: IBody) {
		if (body.value) {
			if (typeof body.value === "string") {
				return Buffer.byteLength(body.value);
			} else if (Buffer.isBuffer(body.value)) {
				return body.value.length;
			} else if (body.type === "json") {
				return Buffer.byteLength(JSON.stringify(body.value));
			} else if (body.type === "urlencoded") {
				const val = new URLSearchParams(body.value);
				return Buffer.byteLength(val.toString());
			} else if (body.type === "multipart" && body.form) {
				return body.form.getLengthSync();
			}
		} else {
			return body.path ? fs.statSync(body.path).size : 0;
		}
	}

	static value(body: IBody) {
		if (body.value) {
			if (typeof body.value === "string" || Buffer.isBuffer(body.value)) {
				return Stream.from(body.value);
			} else if (body.type === "json") {
				return Stream.from(JSON.stringify(body.value));
			} else if (body.type === "urlencoded") {
				const val = new URLSearchParams(body.value);
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
}

global.helpers.body = Body;

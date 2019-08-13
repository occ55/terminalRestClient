"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const Stream_1 = require("./Stream");
const url_1 = require("url");

class Body {
	static size(body) {
		if (body.value) {
			if (typeof body.value === "string") {
				return Buffer.byteLength(body.value);
			} else if (Buffer.isBuffer(body.value)) {
				return body.value.length;
			} else if (body.type === "json") {
				return Buffer.byteLength(JSON.stringify(body.value));
			} else if (body.type === "urlencoded") {
				const val = new url_1.URLSearchParams(body.value);
				return Buffer.byteLength(val.toString());
			} else if (body.type === "multipart" && body.form) {
				return body.form.getLengthSync();
			}
		} else {
			return body.path ? fs.statSync(body.path).size : 0;
		}
	}

	static value(body) {
		if (body.value) {
			if (typeof body.value === "string" || Buffer.isBuffer(body.value)) {
				return Stream_1.Stream.from(body.value);
			} else if (body.type === "json") {
				return Stream_1.Stream.from(JSON.stringify(body.value));
			} else if (body.type === "urlencoded") {
				const val = new url_1.URLSearchParams(body.value);
				return Stream_1.Stream.from(val.toString());
			} else if (body.type === "multipart" && body.form) {
				return body.form;
			}
			return Stream_1.Stream.from("");
		} else if (body.path) {
			return fs.createReadStream(body.path);
		} else {
			console.trace("no path and value");
			return Stream_1.Stream.from("");
		}
	}
}

exports.Body = Body;
global.helpers.body = Body;
//# sourceMappingURL=Body.js.map
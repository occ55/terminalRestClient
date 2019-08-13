"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream = require("stream");
const fs = require("fs");

class Stream {
	static from(val) {
		const str = new stream.Readable();
		str.push(val);
		str.push(null);
		return str;
	}

	static file(path) {
		return fs.createReadStream(path);
	}
}

exports.Stream = Stream;
global;
//# sourceMappingURL=Stream.js.map
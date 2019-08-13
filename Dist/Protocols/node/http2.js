"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Request_1 = require("../../Request");

class http2 extends Request_1.Request {
	constructor(data) {
		super(data);
		throw new Error("Not Implemented");
	}
}

exports.http2 = http2;
Request_1.Protocols.http2 = http2;
//# sourceMappingURL=http2.js.map
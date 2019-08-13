"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Request_1 = require("../Request");

class ws extends Request_1.Request {
	constructor(data) {
		super();
		throw new Error("Not Implemented");
	}
}

exports.ws = ws;
Request_1.Protocols.ws = ws;
//# sourceMappingURL=ws.js.map
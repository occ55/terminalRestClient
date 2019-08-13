"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Request_1 = require("../../Request");

class https extends Request_1.Request {
	constructor(data) {
		super(data);
		console.log(data);
	}
}

exports.https = https;
Request_1.Protocols.https = https;
//# sourceMappingURL=https.js.map
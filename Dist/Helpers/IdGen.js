"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");

function RequestIdGen() {
	return "req_" + crypto_1.randomBytes(16).toString("hex");
}

exports.RequestIdGen = RequestIdGen;
//# sourceMappingURL=IdGen.js.map
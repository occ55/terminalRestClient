"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

function reqUncached(module) {
	delete require.cache[require.resolve(module)];
	return require(module);
}

exports.reqUncached = reqUncached;
//# sourceMappingURL=Require.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

async function Wait(Time) {
	return new Promise(res => setTimeout(res, Time));
}

exports.Wait = Wait;

function NeverEnd() {
	setTimeout(() => {
	}, Math.pow(2, 20));
}

exports.NeverEnd = NeverEnd;
//# sourceMappingURL=Wait.js.map
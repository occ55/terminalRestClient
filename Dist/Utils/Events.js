"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");

class EventPoint extends events_1.EventEmitter {
	Listen(Fn, Name = "$generic$") {
		this.addListener(Name, Fn);
	}

	Invoke(Data, Name = "$generic$") {
		this.emit(Name, Data);
	}

	Remove(Fn, Name = "$generic$") {
		this.removeListener(Name, Fn);
	}
}

exports.EventPoint = EventPoint;
//# sourceMappingURL=Events.js.map
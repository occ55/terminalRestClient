import { EventEmitter } from "events";

export class EventPoint<V, T = (Data: V) => void> extends EventEmitter {
	Listen(Fn: T, Name: string = "$generic$") {
		this.addListener(Name, Fn as any);
	}

	Invoke(Data: V, Name: string = "$generic$") {
		this.emit(Name, Data);
	}

	Remove(Fn: T, Name: string = "$generic$") {
		this.removeListener(Name, Fn as any);
	}
}
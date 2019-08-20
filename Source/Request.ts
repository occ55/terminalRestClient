//lib-protokol
import { INode } from "./Tree";

export const Protocols: Record<string, typeof Request> = {};

export class Request {
	Data: any;
	Hooks: Record<string, Function>[] = [];

	Send() {}

	Build(
		source: INode,
		identifier: string,
		context: any,
		req: any,
		preferedName?: string,
		hooks: any[] = [],
	) {}
}

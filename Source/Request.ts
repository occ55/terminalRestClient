//lib-protokol
import { INode } from "./Tree";

export const Protocols: Record<string, typeof Request> = {};

export class Request {
	Data: any;

	Send() {}

	Build(
		source: INode,
		identifier: string,
		context: any,
		req: any,
		preferedName?: string,
	) {}
}

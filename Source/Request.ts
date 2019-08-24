//lib-protokol
import { INode, IResource } from "./Tree";
import { IAnyRequest } from "./Types/RequestType";

export const Protocols: Record<string, typeof Request> = {};

export class Request {
	Data: any;
	Hooks: Record<string, Function>[] = [];

	Send() {}

	Build(
		source: INode,
		context: any,
		req: IAnyRequest,
		hooks: any[] = [],
		reqResource: IResource,
	) {}
}

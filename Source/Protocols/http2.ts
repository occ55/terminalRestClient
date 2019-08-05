import { Protocols, Request } from "../Request";
import { IBuiltRequest } from "../Helpers/RequestType";

export class http2 extends Request {

  constructor(data: IBuiltRequest) {
    super();
    throw new Error("Not Implemented");
  }

}

Protocols.http2 = http2;
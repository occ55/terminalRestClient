import { Protocols, Request } from "../Request";
import { IBuiltRequest } from "../Helpers/RequestType";

export class ws extends Request {

  constructor(data: IBuiltRequest) {
    super();
    throw new Error("Not Implemented");
  }

}

Protocols.ws = ws;
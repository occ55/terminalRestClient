import { Protocols, Request } from "../Request";
import { IBuiltRequest } from "../Helpers/RequestType";

export class https extends Request {

  constructor(data: IBuiltRequest) {
    super();
    console.log(data);
  }

}

Protocols.https = https;
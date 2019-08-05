import { Protocols, Request } from "../Request";
import { IBuiltRequest } from "../Helpers/RequestType";
import * as httpLib from "http";
import { parse, UrlWithStringQuery } from "url";


export class http extends Request {

  async Send(interactive: boolean = false) {
    let urlData: UrlWithStringQuery = {} as any;
    if (this.Data.request.url) {
      urlData = parse(this.Data.request.url);
    }
    let requestRes = () => {
    };
    const requestP = new Promise<httpLib.IncomingMessage>((res) => {
      requestRes = res;
    });
    const clientReq = httpLib.request({
      headers: this.Data.header,
      host: this.Data.request.host || urlData.host,
      method: this.Data.request.method,
      port: this.Data.request.port || urlData.port,
      path: this.Data.request.path || urlData.path,
    }, requestRes);
    clientReq.on("error", console.log);
    clientReq.end();
    const res = await requestP;
    console.log(res.statusCode);
    const chunks: Buffer[] = [];
    res.on("data", function(chunk) {
      chunks.push(chunk);
    });
    res.on("end", function() {
      const body = Buffer.concat(chunks);
      console.log(body.toString());
    });
  }

  constructor(public Data: IBuiltRequest) {
    super();
  }

}

Protocols.http = http;
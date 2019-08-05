import { NeverEnd } from "./Helpers/Wait";
import "Console";
import "Protocols/https";
import "Protocols/http";
import "Protocols/http2";
import "Protocols/ws";
import { Init } from "./Init";
import { Tree } from "./Tree";

import { Protocols, RequestBuilder } from "./Request";
import { http } from "./Protocols/http";


async function Main() {
  console.log("Rest Client");
  NeverEnd();
  await Init();
  //console.log(Tree.Root.children[0].request);
  const req: http = await RequestBuilder.Build(Tree.Root.children[0]) as http;
  console.log(req.Data);
  //await req.Send();
}

Main();


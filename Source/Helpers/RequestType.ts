import * as http from "http";
import * as http2 from "http2";
import { INode, IResource } from "../Tree";

export type THttpMethods = "GET" | "POST";
export type TProtocols = "http" | "https" | "http2" | "ws";
export type TBodyType = "json" | "xml" | "binary";
export type TBodyTypeNJson = "xml" | "binary";

export interface IRequestNUrl {
  ID: string,
  method: THttpMethods,
  url: undefined,
  host: string,
  port: number,
  protocol: TProtocols,
  path: string,
  sendBody: boolean,
  body?: any,
  bodyType: TBodyType,
  query?: Record<string, string | string[] | number>,
  headers?: http.OutgoingHttpHeaders | http2.OutgoingHttpHeaders,
  //TODO: args ve helpers in tipi
  beforeRequest?: (args: any, helpers: any) => void | boolean,
  afterRequest?: (args: any, result: any, helpers: any) => void,
}

export interface IRequestUrl {
  ID: string,
  url: string,
  host: undefined,
  port: undefined,
  path: undefined,
  method: THttpMethods,
  sendBody: boolean,
  protocol: TProtocols,
  body?: any,
  bodyType: TBodyType,
  query?: Record<string, string | string[] | number>,
  headers?: http.OutgoingHttpHeaders | http2.OutgoingHttpHeaders,
  //TODO: args ve helpers in tipi
  beforeRequest?: (args: any, helpers: any) => void | boolean,
  afterRequest?: (args: any, result: any, helpers: any) => void,
}

export type TRequest = IRequestNUrl | IRequestUrl;

export interface IBuiltRequest {
  context: Record<string, any>,
  request: TRequest,
  requestModule: { ID: string, Properties: Record<string, any> | (() => Record<string, any> | Promise<Record<string, any>>) },
  node: INode,
  requestRes: IResource,
  identifier: string,
  body: { type: TBodyTypeNJson, value?: Buffer | string, path?: string }
    | { type: "json", value: Record<any, string>, path: undefined },
  query: Record<string, any>,
  header: Record<string, any>,

}
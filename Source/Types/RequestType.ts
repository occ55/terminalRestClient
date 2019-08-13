import * as http from "http";
import * as http2 from "http2";
import { INode, IResource } from "../Tree";
import * as FormData from "form-data";

export type THttpMethods = "GET" | "POST";
export type TProtocols = "http" | "https" | "http2" | "ws";
export type TBodyType = "json" | "xml" | "urlencoded" | "multipart" | "binary";
export type TLibs = "node";

export interface IBody {
	type: TBodyType,
	value?: Buffer | string | Record<string, any>,
	path?: string,
	form?: FormData
}

export interface IRequestNUrl {
	lib: TLibs,
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
	lib: TLibs,
	url: string,
	host: undefined,
	port: undefined,
	path: undefined,
	method: THttpMethods,
	sendBody: boolean,
	protocol: undefined,
	body?: any,
	bodyType: TBodyType,
	query?: Record<string, string | string[] | number>,
	headers?: http.OutgoingHttpHeaders | http2.OutgoingHttpHeaders,
	//TODO: args ve helpers in tipi
	beforeRequest?: (args: any, helpers: any) => void | boolean,
	afterRequest?: (args: any, result: any, helpers: any) => void,
}

export type THttpRequest = IRequestNUrl | IRequestUrl;

export interface IBuiltRequest {
	context: Record<string, any>,
	request: THttpRequest,
	requestModule: { ID: string, Properties: Record<string, any> | (() => Record<string, any> | Promise<Record<string, any>>) },
	node: INode,
	requestRes: IResource,
	identifier: string,
	body: IBody,
	query: Record<string, any>,
	header: Record<string, any>,
}

export interface IAnyRequest {
	lib: TLibs,
	protocol?: TProtocols,
	url?: string,
}
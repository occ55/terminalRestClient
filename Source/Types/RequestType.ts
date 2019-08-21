import * as http from "http";
import * as http2 from "http2";
import { FileStruct } from "../Helpers/Body";
import { INode, IResource } from "../Tree";
import { Readable } from "stream";
import * as FormData from "form-data";
import { ReadStream } from "fs";

export type THttpMethods = "GET" | "POST";
export type TProtocols = "http" | "https" | "http2" | "ws";
export type TBodyType = "json" | "xml" | "urlencoded" | "multipart" | "binary";

export interface IBody {
	type: TBodyType,
	value?: Buffer | string | Record<string, any>,
	path?: string,
	form?: FormData
}

export interface IRequestNUrl {
	lib: string,
	method: THttpMethods,
	url?: string,
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
	lib: string,
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
	request: IRequestNUrl,
	requestModule: { ID: string, Properties: Record<string, any> | (() => Record<string, any> | Promise<Record<string, any>>) },
	node: INode,
	requestRes: IResource,
	identifier: string,
	body: IBody,
	query: Record<string, any>,
	headers: Record<string, any>,
	directory: string;
}

export interface IAnyRequest {
	lib: string,
	protocol?: TProtocols,
	url?: string,
}
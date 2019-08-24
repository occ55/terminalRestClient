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

export interface IAnyRequest {
	lib: string,
	protocol?: string,
	url?: string,
	identifiers?: string[]
}

export interface IPreHttpRequest extends IAnyRequest {
	host?: string,
	port?: number | string,
	path?: string,
	method: THttpMethods,
	sendBody: boolean,
	body?: any,
	bodyType: TBodyType,
	query?: Record<string, string | string[] | number>,
	headers?: http.OutgoingHttpHeaders | http2.OutgoingHttpHeaders,
	//TODO: hooks
}


export interface IHttpRequest extends IAnyRequest {
	method: THttpMethods,
	url?: string,
	host: string,
	port: number | string,
	protocol: TProtocols,
	path: string,
	sendBody: boolean,
	body?: any,
	bodyType: TBodyType,
	query?: Record<string, string | string[] | number>,
	headers?: http.OutgoingHttpHeaders | http2.OutgoingHttpHeaders,
}


export interface IBuiltRequest {
	context: Record<string, any>,
	request: IHttpRequest,
	requestModule: { ID: string, Properties: Record<string, any> | (() => Record<string, any> | Promise<Record<string, any>>) },
	node: INode,
	requestRes: IResource,
	identifier: string,
	body: IBody,
	query: Record<string, any>,
	headers: Record<string, any>,
	directory: string;
}


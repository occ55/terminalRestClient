import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { IHttpRequest } from "../Types/RequestType";

export type ICookies = ICookie[];

export interface ICookie {
	value: string,
	domain: string,
	path: string,
	expires?: Date,
	secure: boolean,
	httpOnly: boolean
}

export class Cookie {

	jar: ICookies;
	path: string;

	GetCookies() {

	}

	SetCookies(req: IHttpRequest, cookieStrs: string[]) {
		//const cookies = cookie.parse(cookieStr);
	}

	constructor(cookieJarPath?: string) {
		if (!cookieJarPath) {
			cookieJarPath = join(global.Ex.Root, "cookies.json");
		}
		this.jar = Cookie.GetJar(cookieJarPath);
		this.path = cookieJarPath;
	}

	static GetJar(path: string): ICookies {
		if (!existsSync(path)) {
			writeFileSync(path, JSON.stringify([]));
		}
		return JSON.parse(readFileSync(path, "utf8"));
	}
}

global.helpers.cookie = Cookie;
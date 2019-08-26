import * as setCookie from "set-cookie-parser";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { IncomingHttpHeaders } from "http";
import { join } from "path";
import { ParseDomain } from "../Utils/Domain";

export type ICookies = { cookie: ICookie, info: ICookieRequestInfo }[];

export interface ICookieDomainInfo {
	domain: string;
	tld: string;
	subdomain: string;
}

export interface ICookieRequestInfo extends ICookieDomainInfo {

	setTime: number;
	pathname: string;
	protocol: string;
}

export interface ICookie {
	name: string
	value: string,
	maxAge?: string // okunurken check
	domain?: string, //match olmuyorsa set yapamazsin
	path?: string, // info.pathname bu path ile basliyormu. istenilen path icin
								 // cookie set yapilabilir. ama okunamaz
	expires?: number, //okunurken check
	httpOnly?: boolean, //dont care
	secure?: boolean, //okunurken check
	sameSite: "Strict" | "Lax" //dont care
}

export class Cookie {

	jar: ICookies;
	path: string;

	GetCookieStr() {

	}

	GetCookies() {

	}

	SetCookies(cookieStrs: string[] | string, info: ICookieRequestInfo) {
		if (typeof cookieStrs === "string") {
			cookieStrs = [cookieStrs];
		}
		//TODO: ayni cookie ise override et
		const cookieObjs = setCookie.parse(cookieStrs)
			.map(c => {
				if (c.expires) {
					c.expires = c.expires.getTime() as any;
				}
				return c;
			}) as ICookie[];
		this.jar.push(...cookieObjs.map(co => {
			//sorunlu cookie varsa null return et
			if (co.expires && co.expires <= Date.now()) {
				return null as any;
			}
			if (co.secure && info.protocol !== "https") {
				return null as any;
			}
			if (co.domain && !Cookie.DomainDoesMatch(co.domain, info)) {
				return null as any;
			}
			return {
				cookie: co as ICookie,
				info,
			};
		}).filter(co => !!co));
		Cookie.SaveJar(this.path, this.jar);
	}

	constructor(cookieJarPath?: string) {
		if (!cookieJarPath) {
			cookieJarPath = join(global.Ex.Root, "cookies.json");
		}
		this.jar = Cookie.GetJar(cookieJarPath);
		this.path = cookieJarPath;
	}

	static DomainDoesMatch(cookieDomain: string, i: ICookieDomainInfo) {
		if (cookieDomain.startsWith(".")) {
			cookieDomain = cookieDomain.substr(1);
		}
		if (cookieDomain.endsWith(".")) {
			cookieDomain = cookieDomain.substring(0, cookieDomain.length - 1);
		}
		const p = ParseDomain(cookieDomain);
		if (!p.tld || !i.tld) {
			return false;
		}
		if (p.tld && !p.subdomain && !p.domain) {
			return p.tld === i.tld && !i.domain && !i.subdomain;
		}
		if (p.tld === i.tld && p.domain === i.domain) {
			const iss = i.subdomain.split(".").reverse();
			const pss = p.subdomain.split(".").reverse();
			const minlen = Math.min(iss.length, pss.length);
			for (let k = 0; k < minlen; k++) {
				if (iss.shift() !== pss.shift()) {
					return false;
				}
			}
			return pss.length <= 0;
		} else {
			return false;
		}
	}

	static GetJar(path: string): ICookies {
		if (!existsSync(path)) {
			writeFileSync(path, JSON.stringify([]));
		}
		return JSON.parse(readFileSync(path, "utf8"));
	}

	static SaveJar(path: string, jar: ICookies) {
		writeFileSync(path, JSON.stringify(jar));
	}
}

global.helpers.Cookie = Cookie;
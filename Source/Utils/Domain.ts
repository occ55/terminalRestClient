import * as parseDomain from "parse-domain";

const manuelDomain = (hostname: string) => {
	const obj: { domain: string, subdomain: string, tld: string } = {
		domain: "",
		tld: "",
		subdomain: "",
	};
	const spl = hostname.split(".");
	if (spl.length < 2) {
		obj.tld = spl[0];
	} else if (spl.length > 1) {
		obj.tld = spl.pop()!;
		obj.domain = spl.pop()!;
		obj.subdomain = spl.join(".");
	}
	return obj;
};

export function ParseDomain(hostname: string) {
	const parsed = parseDomain(hostname);
	if (parsed) {
		return parsed;
	} else {
		return manuelDomain(hostname);
	}
}
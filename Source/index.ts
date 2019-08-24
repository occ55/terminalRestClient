global.helpers = {} as any;
import "./Console";
import "./Helpers/Body";
import "./Helpers/Cookie";
import "./Helpers/Stream";
import { Init } from "./Init";
import "./Protocols/node/http";
import { http } from "./Protocols/node/http";
import { RequestBuilder } from "./RequestBuilder";
// tslint:disable-next-line:no-duplicate-imports
import { NeverEnd } from "./Utils/Wait";


async function Index() {
	console.log("Rest Client");
	NeverEnd();
	await Init();
	//console.log(Tree.Root.children[0].request);
	const req = await RequestBuilder.Build(
		(global.$.Login as any),
		{},
	) as http;
	try {
		const result = await req.Send();
		//await result.complete;
		console.log(await result.body, result.toJSON());
		//console.log(result, JSON.stringify(result));
	} catch (ex) {
		console.log("main catch", ex);
	}
	/*const appendFilep = promisify(appendFile);
	const buffs: Buffer[] = [];
	for (let k = 65; k <= 65 + 27; k++) {
		const buff = Buffer.alloc(1024 * 1024 * 100, String.fromCharCode(k));
		buffs.push(buff);
	}
	console.log(readdirSync("."));
	writeFileSync("out.txt", "");
	const ps: Promise<any>[] = [];
	for (const [i, buff] of buffs.entries()) {
		ps.push(appendFilep(`out.txt`, buff));
	}
	console.log("waiting now");
	await Promise.all(ps);
	console.log("done");*/
	//console.log();
	//await req.Send();
}

Index();

/*
* TODO:
*  - file contentine gore header yolla, binary icin vs
*	 - header => headers rename
*  - require icin modul hazirlama, jupyter icin
*  - http2 da server push
*  - kolay workspace ve request olusturucu
*  - sadece o request instance i icin shared data objesi, hooklarin isine yarar
*  - cookie islemleri
*  - etag islemleri
*  - static express sunucusu
*  - hooks.js ekle
*  - file watcher i acip degisimde tree yi yenilemek, Out klasorleri haric
*  - fix arrays for qs and form
*  - requesti dosya olarak vermeden, bulundugun klasorden veya belirtilenden build etme
*  - redirectleri vs takip et (opsiyonlu)
*  - kullanisli scriptler
*  - middleware diyagrami
*  - request manager, cancel vs icin
*  - webstorm plugin?
*  - dateToString kalsin ama yerine responseNameGen (req) => string, ayni isimde varsa silmeyi ekle
*  - moddule yada plugin tarzi bir yapi, protokol helper vs eklemek icin (ilk defa tree olusunca yuklenmesi icin)
*  - ilk 10 disindaki request gecmisini zip icinde sakla
*  - hook argumanlarini destructuring ile duzenle
* */

/*
* TODO: Hooks
*  - [{
* 		afterResponse: () => {},
* 		applicable: ["node", "axios-https", "-https", "-"]
* 	 }]
*  - before/after request build (before(request) after(builtReq))
*  - before send
*  - after response (headers)
*  - after complete
* */

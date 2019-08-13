"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RequestBuilder_1 = require("./RequestBuilder");
global.helpers = {};
const Wait_1 = require("./Utils/Wait");
require("Console");
require("Protocols/node/https");
require("Protocols/node/http");
require("Protocols/node/http2");
require("Protocols/node/ws");
require("Helpers/Body");
require("Helpers/Stream");
const Init_1 = require("./Init");
const Tree_1 = require("./Tree");

async function Main() {
	console.log("Rest Client");
	Wait_1.NeverEnd();
	await Init_1.Init();
	//console.log(Tree.Root.children[0].request);
	const req = await RequestBuilder_1.RequestBuilder.Build(Tree_1.Tree.Root.children[0]);
	try {
		await req.Send();
	} catch (ex) {
		console.log("main catch", ex);
	}
	//console.log();
	//await req.Send();
}

Main();
/*
* TODO:
*  - output handling and saving
*  - handler reutrn form send
*  - save ederken response headerlarina gore dosya uzantisi
*  - file contentine gore header yolla, binary icin vs
*	 - header => headers rename
*  - global.saveToDisk
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
* */
//# sourceMappingURL=Main.js.map
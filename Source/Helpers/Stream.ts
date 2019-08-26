import * as fs from "fs";
import * as stream from "stream";

export class Stream {
	static from(val: string | Buffer) {
		const str = new stream.Readable();
		str.push(val);
		str.push(null);
		return str;
	}

	static file(path: string) {
		return fs.createReadStream(path);
	}
}

global.helpers.Stream = Stream;
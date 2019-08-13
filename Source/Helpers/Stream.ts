import * as stream from "stream";
import * as fs from "fs";

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

global.helpers.stream = Stream;
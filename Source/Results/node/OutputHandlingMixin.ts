import { EventEmitter } from "events";
import {
	appendFileSync,
	createWriteStream,
	existsSync,
	readFileSync,
	statSync, symlinkSync,
	unlinkSync,
} from "fs";
import * as httpLib from "http";
import * as mkdirp from "mkdirp";
import { join } from "path";
import { IBuiltRequest } from "../../Types/RequestType";

export interface OutputHandlingMixin extends EventEmitter {}

export class OutputHandlingMixin {
	response!: httpLib.IncomingMessage | Promise<httpLib.IncomingMessage>;
	extensionOfResponse!: string;
	rawBody?: Buffer;
	isCompleted!: boolean;
	_endedResolve!: Function;
	builtRequest!: IBuiltRequest;
	responseFolder!: string;

	async PreperaOutputFolder() {
		this.responseFolder = join(this.outDir, global.dateToString(new Date));
		if (global.flags.saveToDisk) {
			mkdirp.sync(this.responseFolder);
			if (process.platform !== "win32") {
				const latestPath = join(this.outDir, "0-latest");
				if (existsSync(latestPath)) {
					unlinkSync(latestPath);
				}
				symlinkSync(this.responseFolder, latestPath);
			}
			this.on("error", (ex) => {
				appendFileSync(
					join(this.responseFolder, "error.json"),
					JSON.stringify(ex, Object.getOwnPropertyNames(ex)),
				);
			});
		}
	}

	async HandleOutput(responseFolder: string) {
		this.response = await this.response;
		const responseBodyFile = join(
			responseFolder,
			`./result.${this.extensionOfResponse}`,
		);
		const writeStream = createWriteStream(responseBodyFile);
		this.response.pipe(writeStream);
		writeStream.on("close", () => {
			if (statSync(responseBodyFile).size
				<= global.flags.maxBodyToHoldInMemory) {
				this.rawBody = readFileSync(responseBodyFile);
			}
			this.isCompleted = true;
			this._endedResolve(this.rawBody);
		});
	}

	async HandleOutputNonWrite() {
		this.response = await this.response;
		const chunks: Buffer[] = [];
		this.response.on("data", chunk => {
			chunks.push(chunk);
		});
		this.response.on("end", () => {
			this.rawBody = Buffer.concat(chunks);
			this.isCompleted = true;
			this._endedResolve(this.rawBody);
		});
	}

	get outDir() {
		const outPath = join(this.builtRequest.directory, "./Out");
		if (!existsSync(outPath)) {
			mkdirp.sync(outPath);
		}
		return outPath;
	}
}
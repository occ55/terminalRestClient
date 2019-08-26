import * as jsdom from "jsdom";
import * as xmlParser from "xml-parser";

export class BodyMixin {
	rawBody?: Buffer;
	jsonBody?: any;
	textBody?: string;
	htmlBody?: jsdom.JSDOM;
	xmlBody?: xmlParser.Document;
	complete!: Promise<any>;
	extensionOfResponse!: string;

	get body() {
		return this.complete.then(() => {
			return this.jsonBody
				|| this.htmlBody
				|| this.xmlBody
				|| this.textBody
				|| this.rawBody;
		});
	}

	async ParseOutput() {
		if (!this.rawBody) {
			return;
		}
		const ext = this.extensionOfResponse;
		switch (ext) {
			case "txt":
				this.textBody = this.rawBody.toString();
				break;
			case "json":
				this.jsonBody = JSON.parse(this.rawBody.toString());
				break;
			case "html":
				this.htmlBody = new jsdom.JSDOM(this.rawBody);
				break;
			case "xml":
				this.xmlBody = xmlParser(this.rawBody.toString());
				break;
		}
	}
}
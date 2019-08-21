/**
 * for standard headers
 * @param {*} context
 * @param {THttpRequest} req
 * */
module.exports.before = (context, req) => {
	/**
	 * @type {http.OutgoingHttpHeaders}
	 */
	return {};
};

const ContentTypes = {
	json: "application/json",
	xml: "application/xml",
	form: "application/x-www-form-urlencoded",
};

/**
 * for standard headers
 * @param {*} context
 * @param {THttpRequest} req
 * @param {IBuiltRequest} built
 * */
module.exports.after = async (context, req, built) => {
	const headers = {};
	if (req.sendBody && built.body) {
		if (built.body.form) {
			Object.assign(headers, built.body.form.getHeaders());
		} else {
			headers["Content-Length"] = await global.helpers.body.size(built.body);
			headers["Content-Type"] = await global.helpers.body.type(built.body);
		}
	}
	return headers;
};

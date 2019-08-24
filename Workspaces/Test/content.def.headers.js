/**
 * for standard headers
 * @param {Object} obj
 * @param {*} obj.context
 * @param {IHttpRequest} obj.req
 * @param {*} obj.previous
 * */
module.exports.before = ({ context, req, previous }) => {

};

/**
 * for standard headers
 * @param {Object} obj
 * @param {*} obj.context
 * @param {IHttpRequest} obj.req
 * @param {IBuiltRequest} obj.built
 * @param {*} obj.previous
 * */
module.exports.after = async ({ context, req, built, previous }) => {
	if (req.sendBody && built.body) {
		if (built.body.form) {
			Object.assign(previous, built.body.form.getHeaders());
		} else {
			previous["Content-Length"] = await global.helpers.body.size(built.body);
			previous["Content-Type"] = await global.helpers.body.type(built.body);
		}
	}
};

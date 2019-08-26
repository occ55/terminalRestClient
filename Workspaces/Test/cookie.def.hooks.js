module.exports = async (context) => {
	return {
		applicable: ["node-"],
		afterComplete: async ({ context, req, built, result }) => {
			const cookieHandler = new helpers.Cookie();
			cookieHandler.SetCookies(result.headers["set-cookie"] || result.headers["Set-Cookie"]);
		},
	};
};
module.exports.Properties = (context) => {
	return {
		lib: "node-http",
		url: "http://localhost:3000/get",
		method: "POST",
		sendBody: true,
		body: {
			A: 1,
		},
		query: {
			b: 2,
		},
		//body: require("crypto").randomBytes(50),
		bodyType: "urlencoded",
	};
};

module.exports.ID = "req_Rcz3B45NkacLlCcC8vPGPw==";


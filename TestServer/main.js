const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
const multer = require("multer");
const upload = multer({ dest: "Uploads/" });
const cookieParser = require("cookie-parser");

app.use(cookieParser());

app.get("/", (req, res) => res.send("OK"));

const jsonParser = bodyParser.json();
const formParser = bodyParser.urlencoded();
const rawParser = bodyParser.raw({
	limit: "1gb",
	inflate: true,
	type: "*/*",
});

app.use("/get", rawParser, async (req, res) => {
	console.log(req.method, req.body.length, req.cookies, req.signedCookies, req.body.toString());
	res.cookie("zxc", "2", {
		//domain: ".google.com.tr",
		expires: false,
		/*httpOnly: true,
		maxAge: 1000 * 60 * 60 * 10,
		path: "/",
		sameSite: true,
		secure: false,
		signed: false,*/
	});
	res.cookie("zxc2", "3", {
		//domain: ".google.com.tr",
		expires: false,
		/*httpOnly: true,
		maxAge: 1000 * 60 * 60 * 10,
		path: "/",
		sameSite: true,
		secure: false,
		signed: false,*/
	});
	res.status(200).json({ Status: 200 });
});


app.use("/multipart", upload.none(), async (req, res) => {
	console.log(req.method, req.query, req.body, req.files);
	res.status(200).json({ Status: 200 });
});

app.use("/body/json", jsonParser, async (req, res) => {

});


app.listen(port, () => console.log(`App listening on port ${port}!`));
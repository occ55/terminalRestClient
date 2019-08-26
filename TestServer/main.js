const express = require("express");
const app = express();
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
		httpOnly: true,
	});
	res.cookie("zxc2", "3", {
		domain: "localhost",
		httpOnly: true,
		maxAge: 1000 * 60 * 60 * 24 * 100000,
		expires: new Date(Date.now()),
		path: "/",
		sameSite: true,
		secure: true,
	});
	res.status(200).json({ Status: 200 });
});

const cookieRoute = async (req, res) => {
	console.log(req.cookies);
	res.cookie(Math.random().toString().split(".")[1].split("").map(c => String.fromCharCode(parseInt(c) + 97)).join(""), "1", {
		//domain: "a.test.com",
	});
	res.status(200).send("OK");
};

app.use("/cookie", cookieRoute);
app.use("/cookie/test", cookieRoute);
app.use("/cookietest", cookieRoute);


app.use("/multipart", upload.none(), async (req, res) => {
	console.log(req.method, req.query, req.body, req.files);
	res.status(200).json({ Status: 200 });
});

app.use("/body/json", jsonParser, async (req, res) => {

});


app.listen(3000, () => console.log(`App listening on port ${3000}!`));
app.listen(3001, () => console.log(`App listening on port ${3001}!`));
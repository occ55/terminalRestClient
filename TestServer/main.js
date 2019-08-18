const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
const multer = require("multer");
const upload = multer({ dest: "Uploads/" });

app.get("/", (req, res) => res.send("OK"));

const jsonParser = bodyParser.json();
const formParser = bodyParser.urlencoded();
const rawParser = bodyParser.raw({
	limit: "1gb",
	inflate: true,
	type: "*/*",
});

app.use("/get", rawParser, async (req, res) => {
	console.log(req.method, req.body.length, req.body.toString("utf8"));
	res.status(200).json({ Status: 200 });
});

app.use("/multipart", upload.none(), async (req, res) => {
	console.log(req.method, req.query, req.body, req.files);
	res.status(200).json({ Status: 200 });
});

app.use("/body/json", jsonParser, async (req, res) => {

});


app.listen(port, () => console.log(`App listening on port ${port}!`));
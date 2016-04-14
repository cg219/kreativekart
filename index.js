'use strict';

const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const port = process.env.PORT;
const admin = require("./admin")(express.Router());

app.use(bodyParser.json());
app.use(cookieParser());
app.use("/admin", admin.router);
console.log(admin.router);

let server = app.listen(port, function(){
	let address = server.address().address.startsWith(":") ? "localhost" : server.address().address;
	console.log("Connected at:", `http://${address}:${server.address().port}`);
});
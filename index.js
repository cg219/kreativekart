'use strict';

const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const config = require("./config");
const MongoClient = require("mongodb").MongoClient;
const app = express();
const port = process.env.PORT;
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

let db;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());

MongoClient.connect(config.mongo.uri)
	.then((response)=>{
		db = response;

		app.use(session({
			secret: "kart",
			resave: false,
			saveUninitialized: false,
			store: new MongoStore({
				db: db
			})
		}));

		app.use("/api/products", require("./routes/products")(express.Router(), db).router);
		app.use("/api/orders", require("./routes/orders")(express.Router()).router);
		app.use("/api/customers", require("./routes/customers")(express.Router()).router);

	}, (error)=>{
		console.error(error);
	})

let server = app.listen(port, function(){
	let address = server.address().address.startsWith(":") ? "localhost" : server.address().address;
	console.log("Connected at:", `http://${address}:${server.address().port}`);
});
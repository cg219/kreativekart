'use strict';

const express 			= require("express");
const bodyParser 		= require("body-parser");
const cookieParser 		= require("cookie-parser");
const config 			= require("./config");
const MongoClient 		= require("mongodb").MongoClient;
const app 				= express();
const port 				= process.env.PORT;
const session 			= require("express-session");
const MongoStore 		= require("connect-mongo")(session);
const passport 			= require("passport");
const LocalStrategy 	= require("passport-local").Strategy;
const User 				= require("./models/user");
const middleware		= require("./middleware");

let db;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());

MongoClient.connect(config.mongo.uri)
	.then((response)=>{
		db = response;

		app.use(session({
			secret: "kart",
			resave: true,
			saveUninitialized: true,
			store: new MongoStore({
				db: db
			})
		}));

		passport.use(new LocalStrategy({
			usernameField: "username",
			passwordField: "password"
		}, (username, password, done) => {
			
			db.collection("users").find({username: username}).limit(1).next()
				.then((doc) => {

					if(doc){
						let user = new User(doc);

						if(user.isPasswordValid(password)){
							done(null, user);
						}

						done(null, false, {message: "Incorrect User/Password"});
					}
					else{
						done(null, false, {message: "Incorrect User/Password"});
					}
				}, (err) => {
					console.error(err);
					done(err);
				});
		}));

		passport.serializeUser((user, done) => {
			done(null, user.username);
		})

		passport.deserializeUser((username, done) => {
			db.collection("users").find({username: username}).limit(1).next()
				.then((doc) => {
					let user = new User(doc);

					done(null, user);
				}, (err) => {
					done(err);
				})
		})

		app.use(passport.initialize());
		app.use(passport.session());

		app.use("/admin", require("./routes/admin")(express.Router(), db, passport).router);
		app.use("/products", require("./routes/products")(express.Router(), db).router);
		app.use("/orders", require("./routes/orders")(express.Router()).router);
		app.use("/customers", require("./routes/customers")(express.Router()).router);

		app.get("/", (req, res) => {
			res.json({message: "HOME!"})
		})

		app.get("/fail", (req, res) => {
			res.json({message: "FAILURE!"})
		})

	}, (error)=>{
		console.error(error);
	})

let server = app.listen(port, () => {
	let address = server.address().address.startsWith(":") ? "localhost" : server.address().address;
	console.log("Connected at:", `http://${address}:${server.address().port}`);
});
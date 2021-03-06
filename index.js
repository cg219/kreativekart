'use strict';

const express 			= require("express");
const bodyParser 		= require("body-parser");
const cookieParser 		= require("cookie-parser");
const methodOverride	= require("method-override");
const config 			= require("./config");
const MongoClient 		= require("mongodb").MongoClient;
const app 				= express();
const port 				= process.env.PORT || 5000;
const session 			= require("express-session");
const Redis 	 		= require("redis");
const RedisStore 		= require("connect-redis")(session);
const passport 			= require("passport");
const LocalStrategy 	= require("passport-local").Strategy;
const User 				= require("./models/user");
const middleware		= require("./middleware");

let db;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
// app.use(cookieParser());
app.use(methodOverride());

MongoClient.connect(config.mongo.test, { useNewUrlParser: true })
	.then(response => {
		db = response.db();

		app.use(session({
			secret: "kart",
			name: 'sessionid',
			resave: false,
			saveUninitialized: false,
			store: new RedisStore({
				host: "127.0.0.1",
				port: "6379",
				ttl: 300,
				client: Redis.createClient()
			})
		}));

		passport.use(new LocalStrategy({
			usernameField: "username",
			passwordField: "password"
		}, (username, password, done) => {
			db.collection("users").find({username: username}).limit(1).next()
				.then(doc => {
					if(doc){
						let user = new User(doc);

						if (user.isPasswordValid(password)) {
							done(null, user);
						}

						done(null, false, { message: "Incorrect User/Password" });
					}
					else{
						done(null, false, { message: "Incorrect User/Password" });
					}
				}, err => {
					console.error(err);
					done(err);
				});
		}));

		passport.serializeUser((user, done) => {
			done(null, user.username);
		})

		passport.deserializeUser((username, done) => {
			db.collection("users").find({username: username}).limit(1).next()
				.then(doc => {
					let user = new User(doc);

					done(null, user);
				}, err => done(err));
		})

		app.use(passport.initialize());
		app.use(passport.session());
		app.use(middleware.checkSession);

		app.use("/admin", require("./routes/admin")(express.Router(), db, passport));
		app.use("/products", require("./routes/products")(express.Router(), db));
		// app.use("/orders", require("./routes/orders")(express.Router()));
		// app.use("/customers", require("./routes/customers")(express.Router()));
		app.use("/cart", require("./routes/carts")(express.Router(), db));

	})
	.catch(error => console.error(error));

let server = app.listen(port, () => {
	let address = server.address().address.startsWith(":") ? "localhost" : server.address().address;
	console.log("Connected at:", `http://${address}:${server.address().port}`);
});

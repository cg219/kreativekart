'use strict';

const User = require("../models/user");

class AdminAPI{
	constructor(router, db, passport){
		let _router = this.router = router;
		let _db = db;
		let _passport = passport;

		_router.post("/login", _passport.authenticate("local", { successRedirect: "/", failureRedirect: "/fail"}), (req, res) => {
			console.log("Logging In");
			res.json({message: "Login Called"})
		})

		_router.post("/register", (req, res) => {
			console.log("Registering User:", req.body);

			_db.collection("users").find({username: req.body.username}).limit(1).next()
				.then((doc) => {
					if(doc){
						console.log("Found User");
						res.status(409).json({ message: "User already exists." });
					}
					else{
						console.log("Creating User");
						let user = new User();

						user.username = req.body.username;
						user.password = req.body.password;
						user.role = req.body.role;

						_db.collection("users").insertOne(user)
							.then((doc) => {
								console.log("User Created");
								res.json({
									message: "User added",
									data: {
										user: user
									}
								});
							}, (err) => {
								console.error(err);
								res.status(500).json({message: "Internal Error"});
							})
					}
				}, (err) => {
					console.error(err);
					res.status(500).json({ message: "Internal Error" });
				})
		})
	}
}

module.exports = (router, db, passport) => {
	return new AdminAPI(router, db, passport);
}
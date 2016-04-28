'use strict';

const User 			= require("./../models/user");
const middleware	= require("./../middleware");

class AdminAPI{
	constructor(router, db, passport){
		let _router = this.router = router;
		let _db = db;
		let _passport = passport;

		_router.param("username", function(req, res, next, id){
			console.log("Edit")
			if(id){
				req.username = id;
				next();
			}
			else{
				next();
			}
		})

		_router.post("/login", _passport.authenticate("local"), (req, res) => {
			console.log("Logging In");
			res.json({message: "Logged In"});
		})

		_router.get("/logout", (req, res) => {
			console.log("Logging Out");
			req.logout();
			res.json({message: "Logged Out"});
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
							}, (err) => { middleware.defaultError(err, res); })
					}
				}, (err) => { middleware.defaultEffor(err, res); })
		})

		_router.put("/users/:username/edit", middleware.isLoggedIn, (req, res) => {
			console.log("Editing User:", req.username);

			if((req.user.username == req.username) || (req.user.isAdmin())){
				let updatedUser = Object.assign({}, req.body);

				delete updatedUser.username;

				if( !req.user.isAdmin() ){
					delete updatedUser.role;
				}

				_db.collection("users").findOneAndUpdate({username: req.username}, {$set: updatedUser}, {returnOriginal: false})
					.then((doc) => {
						res.json({
							message: "User Updated",
							data: {
								user: doc.value
							}
						})
					}, (err) => { middleware.defaultError(err, res); });
			}
			else{
				console.log("Permission Needed");
				res.status(401).json({message: "Not an Admin"});
			}
		})

		_router.get("/users/:username", middleware.isLoggedIn, (req, res) => {
			console.log("Getting User:", req.username);

			_db.collection("users").find({username: req.username}).limit(1).next()
				.then((doc) => {
					if(doc){
						res.status(200).json({
							message: "User Found",
							data: {
								user: doc
							}
						});
					}
					else{
						res.status(404).json({ message: "User Not Found"});
					}
				}, (err) => { middleware.defaultError(err, res); })
		})

		_router.get("/users", middleware.isLoggedIn, (req, res) => {
			console.log("Getting Users");

			_db.collection("users").find({}).toArray()
				.then((docs) => {
					res.json({
						message: "All Users",
						data: {
							users: docs
						}
					})
				}, (err) => { middleware.defaultError(err, res); })
		})
	}
}

module.exports = (router, db, passport) => {
	return new AdminAPI(router, db, passport);
}
'use strict';

const User 			= require("./../models/user");
const middleware	= require("./../middleware");

module.exports = (router, db, passport) => {
	return new AdminAPI(router, db, passport);
}

class AdminAPI{
	constructor(router, db, passport){
		router.param("username", getUsername);
		router.post("/login", passport.authenticate("local"), login);
		router.get("/logout", logout);
		router.post("/register", register);
		router.put("/users/:username/edit", middleware.isLoggedIn, editUser);
		router.get("/users/:username", middleware.isLoggedIn, findUser);
		router.get("/users", middleware.isLoggedIn, getAllUsers);

		return router;

		function getUsername(req, res, next, id){
			console.log("Edit")
			if(id){
				req.username = id;
				next();
			}
			else{
				next();
			}
		}

		function login(req, res){
			console.log("Logging In");
			res.json({message: "Logged In"});
		}

		function logout(req, res){
			console.log("Logging Out");
			req.logout();
			res.json({message: "Logged Out"});
		}

		function register(req, res){
			console.log("Registering User:", req.body);
			db.collection("users").find({username: req.body.username}).limit(1).next()
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

						db.collection("users").insertOne(user)
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
		}

		function editUser(req, res){
			console.log("Editing User:", req.username);

			if((req.user.username == req.username) || (req.user.isAdmin())){
				let updatedUser = Object.assign({}, req.body);

				delete updatedUser.username;

				if( !req.user.isAdmin() ){
					delete updatedUser.role;
				}

				db.collection("users").findOneAndUpdate({username: req.username}, {$set: updatedUser}, {returnOriginal: false})
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
				res.status(401).json({message: "Not an Admin or Invalid User"});
			}
		}

		function findUser(req, res){
			console.log("Getting User:", req.username);

			db.collection("users").find({username: req.username}).limit(1).next()
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
		}

		function getAllUsers(req, res){
			console.log("Getting Users");

			db.collection("users").find({}).toArray()
				.then((docs) => {
					res.json({
						message: "All Users",
						data: {
							users: docs
						}
					})
				}, (err) => { middleware.defaultError(err, res); })
		}
	}
}
'use strict';

const User 			= require("./../models/user");
const middleware	= require("./../middleware");

module.exports = (router, db, passport) => new AdminAPI(router, db, passport);

class AdminAPI {
	constructor(router, db, passport) {
		this.db = db;

		router.param("username", this.getUsername.bind(this));
		router.post("/login", passport.authenticate("local"), this.login.bind(this));
		router.get("/logout", this.logout.bind(this));
		router.post("/register", this.register.bind(this));
		router.put("/users/:username/edit", middleware.isLoggedIn, this.editUser.bind(this));
		router.get("/users/:username", middleware.isLoggedIn, this.findUser.bind(this));
		router.get("/users", middleware.isLoggedIn, this.getAllUsers.bind(this));

		return router;
	}

	getUsername(req, res, next, id) {
		console.log("Edit");

		if (id) {
			req.username = id;
			next();
		} else {
			next();
		}
	}

	login(req, res) {
		console.log("Logging In");
		res.json({
			message: "Logged In",
			data: {
				username: req.user.username,
				role: req.user.role
			}
		});
	}

	logout(req, res) {
		console.log("Logging Out");
		req.logout();
		res.json({ message: "Logged Out" });
	}

	register(req, res) {
		console.log("Registering User:", req.body);

		this.db.collection("users").find({username: req.body.username}).limit(1).next()
			.then(doc => {
				if (doc) {
					console.log("Found User");
					res.status(409).json({ message: "User already exists." });
				} else {
					console.log("Creating User");

					let user = new User();

					user.username = req.body.username;
					user.password = req.body.password;
					user.role = req.body.role;

					this.db.collection("users").insertOne(user)
						.then(doc => {
							console.log("User Created");

							res.json({
								message: "User added",
								data: { user: user }
							});
						})
						.catch(err => middleware.defaultError(err, res));
				}
			})
			.catch(err => middleware.defaultEffor(err, res));
	}

	editUser(req, res) {
		console.log("Editing User:", req.username);

		if ((req.user.username == req.username) || req.user.isAdmin()) {
			let updatedUser = Object.assign({}, req.body);

			delete updatedUser.username;

			if (!req.user.isAdmin()) {
				delete updatedUser.role;
			}

			this.db.collection("users")
				.findOneAndUpdate({username: req.username}, {$set: updatedUser}, {returnOriginal: false})
				.then(doc => {
					res.json({
						message: "User Updated",
						data: { user: doc.value }
					})
				})
				.catch(err => middleware.defaultError(err, res));
		} else {
			console.log("Permission Needed");
			res.status(401).json({message: "Not an Admin or Invalid User"});
		}
	}

	findUser(req, res) {
		console.log("Getting User:", req.username);

		this.db.collection("users").find({username: req.username}).limit(1).next()
			.then(doc => {
				if (doc) {
					res.status(200).json({
						message: "User Found",
						data: { user: doc }
					});
				} else {
					res.status(404).json({ message: "User Not Found"});
				}
			})
			.catch(err => middleware.defaultError(err, res))
	}

	getAllUsers(req, res) {
		console.log("Getting Users");

		this.db.collection("users").find({}).toArray()
			.then(docs => {
				res.json({
					message: "All Users",
					data: { users: docs }
				})
			})
			.catch(err => middleware.defaultError(err, res));
	}
}

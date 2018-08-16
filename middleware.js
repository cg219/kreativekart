'use strict';

class Middleware {
	constructor() {}

	isLoggedIn(req, res, next) {
		if (req.user) {
			next();
		} else {
			res.status(401).json({message: "Unauthorized User"});
		}
	}

	isAdmin(req, res, next) {
		if (req.user && req.user.isAdmin()) {
			next();
		} else {
			res.status(401).json({message: "Not an Admin"});
		}
	}

	defaultError(err, res, req) {
		console.error(err);
		res.status(500).json({ message: "Internal Error" });
	}
}

module.exports = new Middleware();

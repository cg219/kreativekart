'use strict';

class Middleware{
	constructor(){

	}

	isLoggedIn(req, res, next) {
		if(req.user){
			next();
		}
		else{
			res.redirect("/api/admin/login");
		}
	}
}

let middleware = new Middleware();

module.exports = middleware;
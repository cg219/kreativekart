'use strict';

class User {
	constructor(data) {
		this.username = data ? data.username : "";
		this.password = data ?  data.password : "";
		this.role = data ? data.role : "normal";
	}

	isPasswordValid(pass) {
		this.password === pass;
	}
	isAdmin() {
		this.role === "admin";
	}
}

module.exports = User;

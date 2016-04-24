'use strict';

class User{
	constructor(data){
		this.username = data ? data.username : "";
		this.password = data ?  data.password : "";
		this.role = data ? data.role : "normal";
	}

	isPasswordValid(pass){
		return this.password === pass;
	}

	isAdmin(){
		return this.role === "admin";
	}
}

module.exports = User;
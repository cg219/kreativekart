'use strict';

const Cart = require("./../models.cart");

class CartAPI{
	constructor(router, db){
		let _router = this.router = router;
		let _db = db;
	}

}

module.exports = (router, db) => {
	return new CartAPI(router, db);
}
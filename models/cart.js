'use strict';

const Product = require("./product");

class Cart{
	constructor(){
		this.bag = new Map();
	}

	addToCart(product, quantity){
		let bag = this.bag;

		if(bag.has(product)){
			bag.set(product, bag.get(product) + quantity);
			return bag;
		}

		bag.set(product, quantity);
		return bag;
	}

	removeFromCart(product, quantity){
		let bag = this.bag;

		if(bag.has(product)){
			bag.set(product, bag.get(product) - quantity);

			if(bag.get(product) <= 0){
				bag.delete(product);
			}
			return bag;
		}
	}

	inCart(){
		return this.bag.entries();
	}
}

module.exports = Cart;
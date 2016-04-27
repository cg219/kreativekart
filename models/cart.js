'use strict';

const Product = require("./product");

class Cart{
	constructor(){
		this.bag = new Map();
	}

	addToCart(item, quantity){
		let bag = this.bag;

		if(bag.has(item)){
			bag.set(item, bag.get(item) + quantity);
			return bag;
		}

		bag.set(item, quantity);
		return bag;
	}

	removeFromCart(item, quantity){
		let bag = this.bag;

		if(bag.has(item)){
			bag.set(item, bag.get(item) - quantity);

			if(bag.get(item) <= 0){
				bag.delete(item);
			}
			return bag;
		}
	}

	get items(){
		return this.bag.entries();
	}

	contains(sku, variation){
		let items = this.items;

		for(var [item] of items){
			if(item.sku == sku && item.variation == variation){
				return item;
			}
		}

		return false;
	}
}

class CartItem{
	constructor(product, variation){
		this.sku = product.sku;
		this.variation = variation || "none";
		this.price = variation ? product.variations[variation].price || product.price;
	}
}

module.exports.Cart = Cart;
module.exports.CartItem = CartItem;
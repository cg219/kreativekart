'use strict';

const Product = require("./product");

class Cart {
	constructor() {
		this.bag = new Map();
		this.serialBag;

		return this;
	}

	addToCart(item, quantity) {
		if (this.bag.has(item)) {
			this.bag.set(item, this.bag.get(item) + quantity);
			return this.bag;
		}

		this.bag.set(item, quantity);
		return this.bag;
	}

	removeFromCart(item, quantity) {
		if (this.bag.has(item)) {
			this.bag.set(item, this.bag.get(item) - quantity);

			if (this.bag.get(item) <= 0) {
				this.bag.delete(item);
			}
			return this.bag;
		}
	}

	get items() {
		return Array.from(this.bag.entries());
	}

	contains(sku, variation) {
		for (let item of this.items) {
			if (item.sku == sku && item.variation == variation) {
				return item;
			}
		}

		return false;
	}

	serialize() {
		this.serialBag = Array.from(this.bag.entries());
		return this;
	}

	deserialize() {
		this.bag = new Map(this.serialBag);
		this.serialBag = null;
	}
}

class CartItem{
	constructor(product, variation) {
		this.sku = product.sku;
		this.variation = variation || "none";
		this.price = variation ? product.variations[variation].price : product.price;
	}
}

exports.Cart = Cart;
exports.CartItem = CartItem;

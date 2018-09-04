'use strict';

const Product = require("./product");
const Order = require('./order');

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

	makeOrder() {
		let order = new Order();
		let bag = this.bag.entries();
		let item = bag.next();

		while(!item.done) {
			let product = new Product(item.value[0]);

			product.quantity = item.value[1];
			order.products.push(product);
			item = bag.next();
		}

		return order;
	}

	get items() {
		return Array.from(this.bag.entries());
	}

	contains(sku, variation) {
		for (let item of this.items) {
			let product = item[0];
			let quantity = item[1];

			if (product.sku == sku && product.variation == variation) {
				return product;
				break;
			}
		}

		return false;
	}

	serialize() {
		this.serialBag = Array.from(this.bag.entries());
		return this;
	}

	deserialize() {
		if (this.serialBag) {
			this.bag = new Map(this.serialBag);
			this.serialBag = null;
		}
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

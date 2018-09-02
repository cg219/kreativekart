'use strict';

const Cart 			= require("./../models/cart").Cart;
const CartItem 		= require("./../models/cart").CartItem;
const Product 		= require("./../models/product");
const middleware	= require("./../middleware");

module.exports = (router, db) => new CartAPI(router, db);

class CartAPI {
	constructor(router, db) {
		this.db = db;

		router.param("sku", this.getSKU.bind(this));
		router.param("amount", this.getAmount.bind(this));
		router.param("variation", this.getVariation.bind(this));
		router.put("/addItem/:sku/:amount/:variation?", this.addItem.bind(this));
		router.put("/removeItem/:sku/:amount/:variation?", this.removeItem.bind(this));
		router.get("/", this.getCart.bind(this));

		return router;
	}

	getSKU(req, res, next, id) {
		if (id) {
			req.sku = id;
			next();
		} else {
			next();
		}
	}

	getAmount(req, res, next, id) {
		if (id) {
			req.amount = Number(id);
			next();
		} else {
			next();
		}
	}

	getVariation(req, res, next, id) {
		if (id) {
			req.variation = id;
			next();
		} else {
			next();
		}
	}

	addItem(req, res) {
		let cart = req.session.cart ? Object.assign(new Cart(), req.session.cart) : new Cart();
		let item = cart.contains(req.sku, (req.variation || "none"));

		if (item) {
			cart.addToCart(item, req.amount);
			req.session.cart = cart.serialize();
			res.status(200).json({
				message: "Item Added",
				data: {
					item: item,
					quantityAdded: req.amount,
					cart: req.session.cart
				}
			});
		} else {
			this.db.collection("products").find({sku: req.sku}).limit(1).next()
				.then(doc => {
					if (doc) {
						item = new CartItem(new Product(doc), req.variation);
						cart.addToCart(item, req.amount);
						req.session.cart = cart.serialize();

						let response = {
							message: "Item Added",
							data: {
								item: item,
								quantityAdded: req.amount,
								cart: cart.items
							}
						}

						res.status(200).json(response);
					}
				})
				.catch(err => middleware.defaultError(err, res));
		}
	}

	removeItem(req, res) {
		let cart = req.session.cart ? Object.assign(new Cart(), req.session.cart) : new Cart();
		let item = cart.contains(req.sku, (req.variation || "none"));

		if (item) {
			cart.removeFromCart(item, req.amount);
			req.session.cart = cart.serialize();
			res.status(200).json({
				message: "Item Removed",
				data: {
					item: item,
					quantityRemoved: req.amount,
					cart: cart.items
				}
			});

		} else {
			this.db.collection("products").find({sku: req.sku}).limit(1).next()
				.then((doc) => {
					if(doc){
						item = new CartItem(new Product(doc), req.variation);
						cart.removeFromCart(item, req.amount);
						req.session.cart = cart.serialize();
						res.status(200).json({
							message: "Item Removed",
							data: {
								item: item,
								quantityRemoved: req.amount,
								cart: cart.items
							}
						});
					}
				})
				.catch(err => middleware.defaultError(err, res));
		}
	}

	getCart(req, res) {
		let cart = Object.assign(new Cart(), req.session.cart);
		cart.deserialize();

		res.status(200).json({
			message: "Items in Cart",
			data: {
				cart: cart.items
			}
		})
	}
}

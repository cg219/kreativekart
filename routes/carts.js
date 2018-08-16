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
		req.session.cart = req.session.cart || new Cart();
		let item = req.session.cart.contains(req.sku, (req.variation || "none"));

		if (item) {
			req.session.cart.addToCart(item, req.amount);
			req.session.save(() => {
				res.status(200).json({
					message: "Item Added",
					data: {
						item: item,
						quantityAdded: req.amount,
						cart: req.session.cart
					}
				});
			});
		} else {
			this.db.collection("products").find({sku: req.sku}).limit(1).next()
				.then((doc) => {
					if (doc) {
						item = new CartItem(new Product(doc), req.variation);
						// req.session.cart.addToCart(item, req.amount);
						req.session.oh = "OH";

						let response = {
							message: "Item Added",
							data: {
								item: item,
								quantityAdded: req.amount,
								// bag: req.session.cart.bag.items
								bag: req.session.oh
							}
						}
						req.session.save(function(){
							console.log(req.session);
							res.status(200).json(response);
						})

					}
				})
				.catch(err => middleware.defaultError(err, res));
		}
	}

	removeItem(req, res) {
		let cart = req.session.cart || new Cart();
		let item = cart.contains(req.sku, (req.variation || "none"));

		if (item) {
			cart.removeFromCart(item, req.amount);
			req.session.cart = cart;
			res.status(200).json({
				message: "Item Removed",
				data: {
					item: item,
					quantityRemoved: req.amount,
					cart: cart
				}
			});
		} else {
			this.db.collection("products").find({sku: req.sku}).limit(1).next()
				.then((doc) => {
					if(doc){
						item = new CartItem(new Product(doc), req.variation);
						cart.removeFromCart(item, req.amount);
						req.session.cart = cart;
						res.status(200).json({
							message: "Item Removed",
							data: {
								item: item,
								quantityRemoved: req.amount,
								cart: cart
							}
						});
					}
				})
				.catch(err => middleware.defaultError(err, res));
		}
	}

	getCart(req, res) {
		console.log("GETTING CART")
		console.log(req.session);

		res.status(200).json({
			message: "Items in Cart",
			data: {
				// items: req.session.cart.items
				items: req.session.oh
			}
		})
	}
}

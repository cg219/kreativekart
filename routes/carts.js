'use strict';

const Cart 			= require("./../models/cart").Cart;
const CartItem 		= require("./../models/cart").CartItem;
const Product 		= require("./../models/product");
const middleware	= require("./../middleware");

class CartAPI{
	constructor(router, db){
		router.param("sku", skuParamHandler);
		router.param("amount", amountParamHandler);
		router.param("variation", variationParamHandler);
		router.put("/addItem/:sku/:amount/:variation?", addItemHandler);
		router.put("/removeItem/:sku/:amount/:variation?", removeItemHandler);
		router.get("/", defaultHandler);

		return router;

		function skuParamHandler(req, res, next, id){
			if(id){
				req.sku = id;
				next();
			}
			else{
				next();
			}
		}

		function amountParamHandler(req, res, next, id){
			if(id){
				req.amount = Number(id);
				next();
			}
			else{
				next();
			}
		}

		function variationParamHandler(req, res, next, id){
			if(id){
				req.variation = id;
				next();
			}
			else{
				next();
			}
		}

		function addItemHandler(req, res){
			let cart = req.session.cart || new Cart();
			let item;

			if(item = cart.contains(req.sku, (req.variation || "none"))){
				cart.addToCart(item, req.amount);
				req.session.cart = cart;
				res.status(200).json({
					message: "Item Added",
					data: {
						item: item,
						quantityAdded: req.amount,
						cart: cart
					}
				})
			}
			else{
				db.collection("products").find({sku: req.sku}).limit(1).next()
					.then((doc) => {
						if(doc){
							item = new CartItem(new Product(doc), req.variation);
							cart.addToCart(item, req.amount);
							req.session.cart = cart;
							console.log(req.session);
							res.status(200).json({
								message: "Item Added",
								data: {
									item: item,
									quantityAdded: req.amount,
									cart: cart
								}
							})
						}
					}, (err) => { middleware.defaultError(err, res) })
			}
		}

		function removeItemHandler(req, res){
			let cart = req.session.cart || new Cart();
			let item;

			if(item = cart.contains(req.sku, (req.variation || "none"))){
				cart.removeFromCart(item, req.amount);
				req.session.cart = cart;
				res.status(200).json({
					message: "Item Removed",
					data: {
						item: item,
						quantityRemoved: req.amount,
						cart: cart
					}
				})
			}
			else{
				db.collection("products").find({sku: req.sku}).limit(1).next()
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
							})
						}
					}, (err) => { middleware.defaultError(err, res) })
			}
		}

		function defaultHandler(req, res){
			console.log(req.session);
			let cart = req.session.cart;

			res.status(200).json({
				message: "Items in Cart",
				data: {
					items: cart.items
				}
			})
		}
	}
}

module.exports = (router, db) => {
	return new CartAPI(router, db);
}
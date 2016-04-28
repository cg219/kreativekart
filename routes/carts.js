'use strict';

const Cart 			= require("./../models/cart").Cart;
const CartItem 		= require("./../models/cart").CartItem;
const Product 		= require("./../models/product");
const middleware	= require("./../middleware");

class CartAPI{
	constructor(router, db){
		let _router = this.router = router;
		let _db = db;

		_router.param("sku", function(req, res, next, id){
			if(id){
				req.sku = id;
				next();
			}
			else{
				next();
			}
		})

		_router.param("amount", function(req, res, next, id){
			if(id){
				req.amount = id;
				next();
			}
			else{
				next();
			}
		})

		_router.param("variation", function(req, res, next, id){
			if(id){
				req.variation = id;
				next();
			}
			else{
				next();
			}
		})

		_router.put("/addItem/:sku/:amount/:variation?", (req, res) => {
			let cart = req.session().cart || new Cart();
			let item;

			console.log("We are in the Cart");
			console.log(cart);

			if(item = cart.contains(req.sku, (req.variation || "none"))){
				cart.addToCart(item, req.amount);
				req.session().cart = cart;
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
				_db.collection("products").find({sku: req.sku}).limit(1).next()
					.then((doc) => {
						if(doc){
							item = new CartItem(new Product(doc) req.variation);
							cart.addToCart(item, req.amount);
							req.session().cart = cart;
							res.status(200).json({
								message: "Item Added",
								data: {
									item: item,
									quantityAdded: req.amount,
									cart: cart
								}
							})
						}
					}, (err) = >{ middleware.defaultError(err, res) })
			}
		})

		_router.put("/removeItem/:sku/:amount/:variation?", (req, res) => {
			let cart = req.session().cart || new Cart();
			let item;

			if(item = cart.contains(req.sku, (req.variation || "none"))){
				cart.removeFromCart(item, req.amount);
				req.session().cart = cart;
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
				_db.collection("products").find({sku: req.sku}).limit(1).next()
					.then((doc) => {
						if(doc){
							item = new CartItem(new Product(doc) req.variation);
							cart.removeFromCart(item, req.amount);
							req.session().cart = cart;
							res.status(200).json({
								message: "Item Removed",
								data: {
									item: item,
									quantityRemoved: req.amount,
									cart: cart
								}
							})
						}
					}, (err) = >{ middleware.defaultError(err, res) })
			}
		})
	}

}

module.exports = (router, db) => {
	return new CartAPI(router, db);
}
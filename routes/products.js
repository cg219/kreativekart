'use strict';
const Product = require("./../models/product");
const Variation = require("./../models/variation");

class ProductsAPI{
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

		_router.delete("/delete/:sku", (req, res) => {
			console.log("Delete a Product");

			_db.collection("products").findOneAndDelete({sku: req.sku})
				.then((doc) => {
					res.json({
						message: "Product Deleted",
						data: {
							product: doc
						}
					})
				}, (err) => {
					console.error(err);
					res.status(500).json({message: "Internal Error"});
				})
		})

		_router.put("/edit/:sku", (req, res) => {
			console.log("Edit a Product");

			_db.collection("products").findOneAndUpdate({sku: req.sku}, {$set: req.body}, {returnOriginal: false})
				.then((doc) => {
					res.json({
						message: "Product Updated",
						data: {
							product: doc
						}
					})
				}, (err) => {
					console.error(err);
					res.status(500).json({message: "Internal Error"});
				})
		})

		_router.post("/add", (req, res) => {
			console.log("Add a product");

			let product = new Product();
			product.sku = req.body.sku;
			product.name = req.body.name;
			product.price = req.body.price;
			product.quantity = req.body.quantity;
			product.description = req.body.description || "";
			product.variations = req.body.variations ? JSON.parse(req.body.variations) : [];

			_db.collection("products").find({sku: product.sku}).limit(1).next()
				.then((doc) => {
					console.log(doc);
					if(doc){
						res.status(500).json({message: "Product with this SKU already exists."});
					}
					else{
						_db.collection("products").insertOne(product)
							.then( (doc) => {
								res.json({
									message: "Product added",
									data: {
										product: product
									}
								});
							}, (err) => {
								console.error(err);
								res.status(500).json({message: "Internal Error"});
							})
					}
				}, (err) => {
					console.error(err);
					res.status(500).json({message: "Internal Error"});
				})
		})

		_router.get("/:sku", (req, res) => {
			console.log(`Getting product with id ${req.sku}`);

			_db.collection("products").find({sku: req.sku}).limit(1).next()
				.then( (doc)=> {
					if(doc){
						res.status(200).json({
							message: "Product found",
							data: {
								product: doc
							}
						})
					}
					else{
						res.status(404).json({ message: "Product Not Found"});
					}
				}, (err) =>{
					console.error(err);
					res.status(500).json({ message: "Internal Error" });
				})
		})

		_router.get("/", (req, res) => {
			console.log("Getting All Products");

			_db.collection("products").find({}).toArray()
				.then( (docs) => {
					res.json({
						message: "All Products",
						data: {
							products: docs
						}
					});
				}, (err) => {
					console.error(err);
					res.status(500).json({ message: "Internal Error" });
				})
		})
	}
}

module.exports = function(router, db){
	return new ProductsAPI(router, db);
}
'use strict';
const Product = require("./../models/product");

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

		_router.post("/add", (req, res) => {
			console.log("Add a product");

			let product = new Product();
			product.sku = req.body.sku;
			product.name = req.body.name;
			product.price = Number(req.body.price);
			product.quantity = Number(req.body.quantity);
			product.description = req.body.description;

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
					console.log(doc);
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
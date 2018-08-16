'use strict';

const Product 		= require("./../models/product");
const Variation 	= require("./../models/variation");
const middleware	= require("./../middleware");

module.exports = (router, db) => new ProductsAPI(router, db);

class ProductsAPI {
	constructor(router, db) {
		this.db = db;

		router.param("sku", this.getSKU.bind(this));
		router.post("/add", middleware.isAdmin, this.addProduct.bind(this));
		router.delete("/:sku", middleware.isAdmin, this.deleteProduct.bind(this));
		router.put("/:sku", middleware.isAdmin, this.editProduct.bind(this));
		router.get("/:sku", this.getProduct.bind(this));
		router.get("/", this.getAllProducts.bind(this));

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

	addProduct(req, res) {
		console.log("Add a product");

		let product = new Product();
		product.sku = req.body.sku;
		product.name = req.body.name;
		product.price = req.body.price;
		product.quantity = req.body.quantity;
		product.description = req.body.description || "";
		product.variations = req.body.variations ? req.body.variations : [];

		this.db.collection("products").find({sku: product.sku}).limit(1).next()
			.then(doc => {
				if (doc) {
					res.status(500).json({message: "Product with this SKU already exists."});
				} else {
					this.db.collection("products").insertOne(product)
						.then(doc => {
							res.json({
								message: "Product added",
								data: { product: product }
							});
						}, err => middleware.defaultError(err, res));
				}
			})
			.catch(err => middleware.defaultError(err, res));
	}

	deleteProduct(req, res) {
		console.log("Delete a Product");

		this.db.collection("products").findOneAndDelete({sku: req.sku})
			.then((doc) => {
				res.json({
					message: "Product Deleted",
					data: { product: doc }
				});
			})
			.catch(err => middleware.defaultError(err, res));
	}

	editProduct(req, res) {
		console.log("Edit a Product");

		this.db.collection("products").findOneAndUpdate({sku: req.sku}, {$set: req.body}, {returnOriginal: false})
			.then(doc => {
				res.json({
					message: "Product Updated",
					data: { product: doc.value }
				});
			})
			.catch(err => middleware.defaultError(err, res));
	}

	getProduct(req, res) {
		console.log(`Getting product with id ${req.sku}`);

		this.db.collection("products").find({sku: req.sku}).limit(1).next()
			.then(doc => {
				if (doc) {
					res.status(200).json({
						message: "Product found",
						data: { product: doc }
					});
				} else {
					res.status(404).json({ message: "Product Not Found"});
				}
			})
			.catch(err => middleware.defaultError(err, res));
	}

	getAllProducts(req, res) {
		console.log("Getting All Products");

		this.db.collection("products").find({}).toArray()
			.then(docs => {
				res.json({
					message: "All Products",
					data: { products: docs }
				});
			})
			.catch(err => middleware.defaultError(err, res));
	}
}

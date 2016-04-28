'use strict';

let should 		= require("should");
let assert		= require("assert");
let request		= require("supertest");
let agent 		= require("superagent");
let MongoClient	= require("mongodb").MongoClient;
let config		= require("./../config");
let db;

describe("Kreative Kart", () => {
	let api = "http://localhost:5000";
	let normalUser;
	let adminUser;
	let productAdmin;

	before((done) => {
		normalUser = agent.agent();
		adminUser = agent.agent();

		MongoClient.connect(config.mongo.test)
			.then((response) => {
				db = response;
				done();
			})
	})

	describe("Users", () => {
		after((done) => {
			db.collection("users").drop()
				.then((respone) => {
					console.log("Cleared Users Collection");
					done();
				})
		})

		it("should create a admin", (done) => {
			let user = {
				username: "test_admin",
				password: "test_pass",
				role: "admin"
			}

			request(api)
				.post("/admin/register")
				.send(user)
				.expect(200)
				.end((err, res) => {
					res.body.message.should.equal("User added");
					res.body.data.user.should.not.equal(null);
					res.body.data.user.role.should.equal("admin");
					done();
				})
		})

		it("should create a normal user", (done) => {
			let user = {
				username: "test_user",
				password: "test_pass",
				role: "normal"
			}

			request(api)
				.post("/admin/register")
				.send(user)
				.expect(200)
				.end((err, res) => {
					res.body.message.should.equal("User added");
					res.body.data.user.should.not.equal(null);
					res.body.data.user.role.should.equal("normal");
					done();
				})
		})

		it("should log a user in", (done) => {
			let user = {
				username: "test_user",
				password: "test_pass"
			}

			normalUser
				.post(api + "/admin/login")
				.send(user)
				.end((err, res) => {
					res.body.message.should.not.equal(null);
					done();
				})
		})

		it("should get all users", (done) => {
			normalUser
				.get(api + "/admin/users/")
				.end((err, res) => {
					res.body.message.should.equal("All Users");
					res.body.data.users.should.not.equal(null);
					done();
				})
		})

		it("should get a user", (done) => {
			normalUser
				.get(api + "/admin/users/test_user")
				.end((err, res) => {
					res.body.message.should.equal("User Found");
					res.body.data.user.should.not.equal(null);
					done();
				})
		})

		it("should correctly edit the password", (done) => {
			let user = {
				username: "test_user",
				password: "test_pass_again"
			}

			normalUser
				.put(api + "/admin/users/test_user/edit")
				.send(user)
				.end((err, res) => {
					res.body.message.should.equal("User Updated");
					res.body.data.user.password.should.not.equal("test_pass");
					res.body.data.user.password.should.equal("test_pass_again");
					done();
				})
		})

		it("should stop a normal user from changing another user's credentials", (done) => {
			let user = {
				username: "test_user",
				password: "test_pass_again"
			}

			normalUser
				.put(api + "/admin/users/test_admin/edit")
				.send(user)
				.end((err, res) => {
					res.body.message.should.equal("Not an Admin or Invalid User");
					res.status.should.equal(401);
					done();
				})
		})
	})

	describe("Products", () => {
		before((done) => {
			let user = {
				username: "test_admin",
				password: "password",
				role: "admin"
			}

			db.collection("users").insertOne(user)
				.then(() => {
					delete user.role;
					
					productAdmin = agent.agent();
					productAdmin
						.post(api + "/admin/login")
						.send(user)
						.end((err, res) => {
							done();
						})
				})
		})

		after((done) => {
			db.collection("users").drop()
				.then((respone) => {
					console.log("Cleared Users Collection");

					db.collection("products").drop()
						.then((respone) => {
							console.log("Cleared Products Collection");
							done();
						})
				})
		})

		it("should add a product to the store", (done) => {
			let product = {
				sku: "testsku",
				name: "test product",
				price: 300,
				quantity: 30,
				description: "test description"
			}

			productAdmin
				.post(api + "/products/add")
				.send(product)
				.end((err, res) => {
					res.body.message.should.equal("Product added");
					res.status.should.equal(200);
					res.body.data.product.should.not.equal(null);
					done();
				})
		})

		it("should add a product with a variation to the store", (done) => {
			let product = {
				sku: "testsku2",
				name: "test product with a variation",
				price: 100,
				quantity: 30,
				description: "test description again",
				variations: [
					{
						"name": "Blue",
						"price": 100,
						"quantity": 10,
						"description": "Blue Version"
					}
				]
			}

			productAdmin
				.post(api + "/products/add")
				.send(product)
				.end((err, res) => {
					res.status.should.equal(200);
					// res.body.message.should.equal("Product added");
					// res.status.should.equal(200);
					// res.body.data.product.should.not.equal(null);
					// res.body.data.product.variations.should.not.equal(null);
					done();
				})
		})

		it("should add a product with multiple variations to the store", (done) => {
			let product = {
				sku: "testsku3",
				name: "test product with 3 variations",
				price: 100,
				quantity: 30,
				description: "test description with variation",
				variations: [
					{
						name: "Blue",
						price: 100,
						quantity: 10,
						description: "Blue Version"
					},
					{
						name: "Red",
						price: 100,
						quantity: 10,
						description: "Red Version"
					},
					{
						name: "Green",
						price: 100,
						quantity: 10,
						description: "Green Version"
					}
				]
			}

			productAdmin
				.post(api + "/products/add")
				.send(product)
				.end((err, res) => {
					res.body.message.should.equal("Product added");
					res.status.should.equal(200);
					res.body.data.product.should.not.equal(null);
					res.body.data.product.variations.length.should.equal(3);
					done();
				})
		})

		it("should stop admin from adding duplicate products to the store", (done) => {
			let product = {
				sku: "testsku",
				name: "test product",
				price: 300,
				quantity: 30,
				description: "test description"
			}

			productAdmin
				.post(api + "/products/add")
				.send(product)
				.end((err, res) => {
					res.body.message.should.equal("Product with this SKU already exists.");
					res.status.should.equal(500);
					done();
				})
		})

		it("should get all the products in the store", (done) => {
			request(api)
				.get("/products")
				.end((err, res) => {
					res.status.should.equal(200);
					res.body.message.should.equal("All Products");
					res.body.data.products.should.not.equal(null);
					done();
				})
		})

		it("should get a product in the store", (done) => {
			request(api)
				.get("/products/testsku")
				.end((err, res) => {
					res.status.should.equal(200);
					res.body.message.should.equal("Product found");
					res.body.data.product.should.not.equal(null);
					done();
				})
		})

		it("should not find a product in the store", (done) => {
			request(api)
				.get("/products/testskuhi")
				.end((err, res) => {
					res.status.should.equal(404);
					res.body.message.should.equal("Product Not Found");
					done();
				})
		})

		it("should edit a product in the store", (done) => {
			let product = {
				sku: "testsku",
				name: "test product Name has changed",
				price: 300,
				quantity: 20,
				description: "test description"
			}

			productAdmin
				.put(api + "/products/testsku")
				.send(product)
				.end((err, res) => {
					res.status.should.equal(200);
					res.body.message.should.equal("Product Updated");
					res.body.data.product.name.should.equal("test product Name has changed");
					res.body.data.product.quantity.should.equal(20);
					done();
				})
		})

		it("should delete a product from the store", (done) => {
			productAdmin
				.delete(api + "/products/testsku")
				.end((err, res) => {
					res.status.should.equal(200);
					res.body.message.should.equal("Product Deleted");

					request(api)
						.get("/products/testsku")
						.end((err, res) => {
							res.status.should.equal(404);
							res.body.message.should.equal("Product Not Found");
							done();
						})
				})
		})
	})
})
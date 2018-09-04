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
	let shoppingUser;

	before((done) => {
		normalUser = agent.agent();
		adminUser = agent.agent();
		productAdmin = agent.agent();
		shoppingUser = agent.agent();

		MongoClient.connect(config.mongo.test, { useNewUrlParser: true })
			.then((response) => {
				db = response.db();
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
				.end((err, res) => {
					res.status.should.equal(200);
					res.body.data.user.should.not.equal(null);
					res.body.data.user.role.should.equal("admin");
					res.body.data.user.username.should.equal("test_admin");
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
				.end((err, res) => {
					res.status.should.equal(200);
					res.body.data.user.should.not.equal(null);
					res.body.data.user.role.should.equal("normal");
					res.body.data.user.username.should.equal("test_user");
					done();
				})
		})

		it("should log a user in", (done) => {
			let user = {
				username: "test_user",
				password: "test_pass"
			}

			normalUser
				.post(`${api}/admin/login`)
				.send(user)
				.end((err, res) => {
					res.body.message.should.not.equal(null);
					res.body.data.username.should.equal(user.username);
					res.body.data.role.should.equal('normal');
					done();
				})
		})

		it("should get all users", (done) => {
			normalUser
				.get(`${api}/admin/users/`)
				.end((err, res) => {
					res.body.data.users.should.not.equal(null);
					done();
				})
		})

		it("should get a user", (done) => {
			normalUser
				.get(`${api}/admin/users/test_user`)
				.end((err, res) => {
					res.body.data.user.username.should.equal("test_user");
					done();
				})
		})

		it("should correctly edit the password", (done) => {
			let user = {
				username: "test_user",
				password: "test_pass_again"
			}

			normalUser
				.put(`${api}/admin/users/test_user/edit`)
				.send(user)
				.end((err, res) => {
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
				.put(`${api}/admin/users/test_admin/edit`)
				.send(user)
				.end((err, res) => {
					res.status.should.equal(401);
					done();
				})
		})

		it("should logout the user", (done) => {
			normalUser
				.get(`${api}/admin/logout`)
				.end((err, res) => {
					res.status.should.equal(200);

					normalUser
						.get(api + "/admin/users")
						.end((err, res) => {
							res.status.should.equal(401);
							done();
						})
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

					productAdmin
						.post(`${api}/admin/login`)
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
				.post(`${api}/products/add`)
				.send(product)
				.end((err, res) => {
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
				.post(`${api}/products/add`)
				.send(product)
				.end((err, res) => {
					res.status.should.equal(200);
					res.body.data.product.should.not.equal(null);
					res.body.data.product.variations.should.not.equal(null);
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
				.post(`${api}/products/add`)
				.send(product)
				.end((err, res) => {
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
				.post(`${api}/products/add`)
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
					res.body.data.products.should.not.equal(null);
					done();
				})
		})

		it("should get a product in the store", (done) => {
			request(api)
				.get("/products/testsku")
				.end((err, res) => {
					res.status.should.equal(200);
					res.body.data.product.should.not.equal(null);
					res.body.data.product.sku.should.equal("testsku");
					done();
				})
		})

		it("should not find a product in the store", (done) => {
			request(api)
				.get("/products/testskuhi")
				.end((err, res) => {
					res.status.should.equal(404);
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
				.put(`${api}/products/testsku`)
				.send(product)
				.end((err, res) => {
					res.status.should.equal(200);
					res.body.data.product.name.should.equal("test product Name has changed");
					res.body.data.product.quantity.should.equal(20);
					done();
				})
		})

		it("should delete a product from the store", (done) => {
			productAdmin
				.delete(`${api}/products/testsku`)
				.end((err, res) => {
					res.status.should.equal(200);

					request(api)
						.get("/products/testsku")
						.end((err, res) => {
							res.status.should.equal(404);
							done();
						})
				})
		})
	})

	describe("Cart", () => {
		before((done) => {
			let product1 = {
				sku: "vodka",
				name: "Vodka",
				price: 300,
				quantity: 30,
				description: "test description"
			}

			let product2 = {
				sku: "martini",
				name: "Martini",
				price: 10,
				quantity: 30,
				description: "test description again",
				variations: [
					{
						"name": "Apple",
						"price": 6,
						"quantity": 10,
						"description": "Apple Version"
					}
				]
			}

			let product3 = {
				sku: "henny",
				name: "Hennessy",
				price: 100,
				quantity: 30,
				description: "test description again",
				variations: [
					{
						"name": "White",
						"price": 100,
						"quantity": 10,
						"description": "White Version"
					}
				]
			}

			let product4 = {
				sku: "gin",
				name: "Gin",
				price: 100,
				quantity: 30,
				description: "test description with variation",
				variations: [
					{
						name: "Juice",
						price: 100,
						quantity: 10,
						description: "Gin and Juice Version"
					},
					{
						name: "Tonic",
						price: 100,
						quantity: 10,
						description: "Gin and Tonic Version"
					},
					{
						name: "Red Bull",
						price: 100,
						quantity: 10,
						description: "Red Bull Version"
					}
				]
			}

			db.collection("products").insertMany([product1, product2, product3, product4])
				.then((response) => {
					console.log("Added Test Products");
					done();
				})
		})

		after((done) => {
			db.collection("products").drop()
				.then(response => {
					console.log("Cleared Products Collection");

					db.collection("customers").drop()
						.then(response => {
							console.log("Cleared Customers Collection");

							db.collection("orders").drop()
								.then(response => {
									console.log("Cleared Orders Collection");
									done();
								})
						})
				})
		})

		it("should add item to cart", (done) => {
			shoppingUser
				.put(`${api}/cart/addItem/vodka/2`)
				.end((err, res) => {
					res.status.should.equal(200);
					res.body.data.quantityAdded.should.equal(2);
					done();
				})
		})

		it("should check items in cart", (done) => {
			shoppingUser
				.get(`${api}/cart`)
				.end((err, res) => {
					res.status.should.equal(200);
					res.body.data.cart[0][0].sku.should.equal('vodka');
					res.body.data.cart[0][1].should.equal(2);
					done();
				})
		})

		it("should change quantity of item in cart", (done) => {
			shoppingUser
				.put(`${api}/cart/addItem/vodka/1`)
				.end((err, res) => {
					res.status.should.equal(200);
					res.body.data.quantityAdded.should.equal(1);
					res.body.data.cart[0][0].sku.should.equal('vodka');
					res.body.data.cart[0][1].should.equal(3);
					done();
				})
		})

		it("should decrease quantity of item in cart", (done) => {
			shoppingUser
				.put(`${api}/cart/removeItem/vodka/1`)
				.end((err, res) => {
					res.status.should.equal(200);
					res.body.data.quantityRemoved.should.equal(1);
					res.body.data.cart[0][0].sku.should.equal('vodka');
					res.body.data.cart[0][1].should.equal(2);
					done();
				})
		})

		it("should fail removing an item not in cart", (done) => {
			shoppingUser
				.put(`${api}/cart/removeItem/gin/1`)
				.end((err, res) => {
					res.status.should.equal(304);
					done();
				})
		})

		it("should create an order", (done) => {
			let customer = {
				customer: {
					streetAddress: '125 Nunya Blvd',
					city: 'Hollywood',
					zipcode: '43132',
					firstName: 'Johnny',
					lastName: 'Walker'
				}
			}

			shoppingUser
				.post(`${api}/cart/order`)
				.send(customer)
				.end((err, res) => {
					res.status.should.equal(200);
					res.body.data.orderNumber.should.exist;
					done();
				})
		})
	})
})

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
					db.close();
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
				// .expect(200)
				.end((err, res) => {
					res.body.message.should.not.equal(null);
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
				// .expect(200)
				.end((err, res) => {
					res.body.message.should.equal("User Updated");
					res.body.data.user.password.should.not.equal("test_pass");
					res.body.data.user.password.should.equal("test_pass_again");
					done();
				})
		})
	})
})
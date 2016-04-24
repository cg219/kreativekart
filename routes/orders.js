'use strict';

const middleware	= require("./../middleware");

class OrdersAPI{
	constructor(router, db){
		let _router = this.router = router;
		let _db = db;

		_router.param("orderID", (req, res, next, id) => {
			if(id){
				req.orderID = id;
				next();
			}
			else{
				next();
			}
		})

		_router.get("/:orderID", middleware.isLoggedIn, (req, res) => {
			console.log(`Getting order with id ${req.orderID}`);

			_db.collection("orders").find({orderID: req.orderID}).limit(1).next()
				.then( (doc)=> {
					if(doc){
						res.status(200).json({
							message: "Order found",
							data: {
								order: doc
							}
						})
					}
					else{
						res.status(404).json({ message: "Order Not Found"});
					}
				}, (err) =>{ middleware.defaultError(err, res); })
		})

		_router.get("/", middleware.isLoggedIn, (req, res) => {
			console.log("Getting All Orders");

			_db.collection("orders").find({}).toArray()
				.then( (docs) => {
					res.json({
						message: "All Orders",
						data: {
							orders: docs
						}
					});
				}, (err) => { middleware.defaultError(err, res); })
		})
	}
}

module.exports = (router, db) => {
	return new OrdersAPI(router, db);
}
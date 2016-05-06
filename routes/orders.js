'use strict';

const middleware	= require("./../middleware");

module.exports = (router, db) => {
	return new OrdersAPI(router, db);
}

class OrdersAPI{
	constructor(router, db){
		router.param("orderID", getOrderID);
		router.get("/:orderID", middleware.isLoggedIn, getOrder);
		router.get("/", middleware.isLoggedIn, getAllOrders);

		return router;

		function getOrderID(req, res, next, id){
			if(id){
				req.orderID = id;
				next();
			}
			else{
				next();
			}
		}

		function getOrder(req, res){
			console.log(`Getting order with id ${req.orderID}`);

			db.collection("orders").find({orderID: req.orderID}).limit(1).next()
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
		}

		function getAllOrders(req, res){
			console.log("Getting All Orders");

			db.collection("orders").find({}).toArray()
				.then( (docs) => {
					res.json({
						message: "All Orders",
						data: {
							orders: docs
						}
					});
				}, (err) => { middleware.defaultError(err, res); })
		}
	}
}
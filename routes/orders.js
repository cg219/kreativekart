'use strict';

class OrdersAPI{
	constructor(router, db){
		let _router = this.router = router;
		let _db = db;

		_router.param("orderID", function(req, res, next, id){
			if(id){
				req.orderID = id;
				next();
			}
			else{
				next();
			}
		})

		_router.get("/:orderID", (req, res) => {
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
				}, (err) =>{
					console.error(err);
					res.status(500).json({ message: "Internal Error" });
				})
		})

		_router.get("/", (req, res) => {
			console.log("Getting All Orders");

			_db.collection("orders").find({}).toArray()
				.then( (docs) => {
					res.json({
						message: "All Orders",
						data: {
							orders: docs
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
	return new OrdersAPI(router, db);
}
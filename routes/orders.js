'use strict';

class OrdersAPI{
	constructor(router){
		let _router = this.router = router;

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

			res.json({ message: `Getting order with id ${req.orderID}`, orderID: req.orderID });
		})

		_router.get("/", (req, res) => {
			console.log("Getting All Orders");

			res.json({ message: "Getting All Orders" });
		})
	}
}

module.exports = function(router){
	return new OrdersAPI(router);
}
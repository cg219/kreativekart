'use strict';

class Admin{
	constructor(router){
		let _router = this.router = router;

		_router.param("productID", function(req, res, next, id){
			if(id){
				req.productID = id;
				next();
			}
			else{
				next();
			}
		})

		_router.param("orderID", function(req, res, next, id){
			if(id){
				req.orderID = id;
				next();
			}
			else{
				next();
			}
		})

		_router.param("customerID", function(req, res, next, id){
			if(id){
				req.customerID = id;
				next();
			}
			else{
				next();
			}
		})

		_router.get("/products/:productID?", (req, res) => {
			console.log("Getting All Products");

			if(req.productID){
				res.json({ message: `Getting product with id ${req.productID}`, productID: req.productID });
			}
			else{
				res.json({ message: "Getting All Products" });
			}
			
		})

		_router.get("/orders/:orderID?", (req, res) => {
			console.log("Getting All Orders");

			if(req.orderID){
				res.json({ message: `Getting order with id ${req.orderID}`, orderID: req.orderID });
			}
			else{
				res.json({ message: "Getting All Orders" });
			}
			
		})

		_router.get("/customers/:customerID?", (req, res) => {
			console.log("Getting All Customers");

			if(req.customerID){
				res.json({ message: `Getting customer with id ${req.customerID}`, orderID: req.customerID });
			}
			else{
				res.json({ message: "Getting All Customers" });
			}
			
		})
	}
}

module.exports = function(router){
	return new Admin(router);
}
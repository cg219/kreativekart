'use strict';

class CustomersAPI{
	constructor(router){
		let _router = this.router = router;

		_router.param("customerID", function(req, res, next, id){
			if(id){
				req.customerID = id;
				next();
			}
			else{
				next();
			}
		})

		_router.get("/:customerID", (req, res) => {
			console.log(`Getting customer with id ${req.customerID}`);

			res.json({ message: `Getting customer with id ${req.customerID}`, customerID: req.customerID });
		})

		_router.get("/", (req, res) => {
			console.log("Getting All Customers");

			res.json({ message: "Getting All Customers" });
		})
	}
}

module.exports = function(router){
	return new CustomersAPI(router);
}
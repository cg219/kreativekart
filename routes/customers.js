'use strict';

module.exports = router) => new CustomersAPI(router);

class CustomersAPI {
	constructor(router) {
		router.param("customerID", this.getCustomerID.bind(this));
		router.get("/:customerID", this.getCustomer.bind(this));
		router.get("/", this.getAllCustomers.bind(this));

		return router;
	}

	getCustomerID(req, res, next, id) {
		if (id) {
			req.customerID = id;
			next();
		} else {
			next();
		}
	}

	getCustomer(req, res) {
		console.log(`Getting customer with id ${req.customerID}`);
		res.json({ message: `Getting customer with id ${req.customerID}`, customerID: req.customerID });
	}

	getAllCustomers(req, res) {
		console.log("Getting All Customers");
		res.json({ message: "Getting All Customers" });
	}
}

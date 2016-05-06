'use strict';

module.exports = function(router){
	return new CustomersAPI(router);
}

class CustomersAPI{
	constructor(router){
		router.param("customerID", getCustomerID);
		router.get("/:customerID", getCustomer);
		router.get("/", getAllCustomers);

		return router;

		function getCustomerID(req, res, next, id){
			if(id){
				req.customerID = id;
				next();
			}
			else{
				next();
			}
		}

		function getCustomer(req, res){
			console.log(`Getting customer with id ${req.customerID}`);
			res.json({ message: `Getting customer with id ${req.customerID}`, customerID: req.customerID });
		}

		function getAllCustomers(req, res){
			console.log("Getting All Customers");
			res.json({ message: "Getting All Customers" });
		}
	}
}
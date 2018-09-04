'use strict';

const middleware	= require('./../middleware');

module.exports = (router, db) =>  new OrdersAPI(router, db);

class OrdersAPI {
	constructor(router, db) {
		this.db = db;

		router.param('orderID', this.getOrderID.bind(this));
		router.get('/:orderID', middleware.isLoggedIn, this.getOrder.bind(this));
		router.get('/', middleware.isLoggedIn, this.getAllOrders.bind(this));

		return router;
	}

	getOrderID(req, res, next, id) {
		if (id) {
			req.orderID = id;
			next();
		} else {
			next();
		}
	}

	getOrder(req, res) {
		console.log(`Getting order with id ${req.orderID}`);

		this.db.collection('orders').find({orderID: req.orderID}).limit(1).next()
			.then(doc => {
				if (doc) {
					res.status(200).json({
						message: 'Order found',
						data: { order: doc }
					})
				} else {
					res.status(404).json({ message: 'Order Not Found'});
				}
			})
			.catch(err => middleware.defaultError(err, res));
	}

	getAllOrders(req, res) {
		console.log('Getting All Orders');

		this.db.collection('orders').find({}).toArray()
			.then(docs => {
				res.json({
					message: 'All Orders',
					data: { orders: docs }
				});
			})
			.catch(err => middleware.defaultError(err, res));
	}
}

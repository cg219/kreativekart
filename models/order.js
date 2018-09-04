'use strict';

class Order {
	constructor(data) {
		this.orderNumber = data && data.orderNumber || createOrderNumber();
		this.products = data && data.products || [];
		this.customer = data && data.customer || "";
		this.orderAmount = data && data.orderAmount || 0;
		this.totalAmount = data && data.totalAmount || 0;
		this.taxAmount = data && data.taxAmount || 0;
		this.status = data && data.status || "created";

		function createOrderNumber() {
			let orderNumber = `${Math.floor(Math.random() * 10)}${Date.now().toString()}`;

			return [ orderNumber.slice(0, 2), orderNumber.slice(2, 10), orderNumber.slice(10, 14) ].join('-');
		}
	}

	get amount() {
		return this.orderAmount;
	}

	set amount(value) {
		this.orderAmount = Number(value);
	}

	get total() {
		return this.totalAmount;
	}

	set total(value) {
		this.totalAmount = Number(value);
	}
}

module.exports = Order;

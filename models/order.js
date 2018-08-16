'use strict';

class Order {
	constructor() {
		this.orderID = "";
		this.products = [];
		this.customer = "";
		this.orderAmount = "";
		this.status = "pending";
	}

	get amount(){
		return this.orderAmount;
	}

	set amount(value){
		this.orderAmount = Number(value);
	}
}

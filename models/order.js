'use strict';

class Order{
	constructor(){
		this.orderID = "";
		this.products = [];
		this.customer = "";
		this._amount = "";
		this.status = "pending";
	}

	get amount(){
		return this._amount;
	}

	set amount(value){
		this._amount = Number(value);
	}
}
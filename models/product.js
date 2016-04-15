'use strict';

class Product{
	constructor(){
		this.sku = "";
		this.name = "";
		this._price = "";
		this._quantity = "";
		this.description = "";
	}

	set price(val){
		this._price = Number(val);
	}

	get price(){
		return this._price;
	}

	set quantity(val){
		this._quantity = Number(val);
	}

	get quantity(){
		return this._quantity;
	}
}

module.exports = Product;
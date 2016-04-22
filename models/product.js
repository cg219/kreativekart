'use strict';

class Product{
	constructor(data){
		this.sku = data ? data.sku : "";
		this.name = data ? data.name : "";
		this._price = data ? data.price : 0;
		this._quantity = data ? data.quantity : -1;
		this.description = data ? data.description : "";
		this.variations = data ? data.variations : [];
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
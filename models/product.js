'use strict';

class Product {
	constructor(data) {
		this.sku = data ? data.sku : "";
		this.name = data ? data.name : "";
		this.productPrice = data ? data.price : 0;
		this.productQt = data ? data.quantity : -1;
		this.description = data ? data.description : "";
		this.variations = data ? data.variations : [];
	}

	set price(val){
		this.productPrice = Number(val);
	}

	get price(){
		return this.productPrice;
	}

	set quantity(val){
		this.productQt = Number(val);
	}

	get quantity(){
		return this.productQt;
	}
}

module.exports = Product;

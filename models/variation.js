'use strict';

class Variation{
	constructor(){
		this.name = "";
		this._price = "";
		this.description = "";
		this._quantity = 0;
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

module.exports = Variation;
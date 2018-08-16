'use strict';

class Variation {
	constructor() {
		this.name = "";
		this.variationPrice = "";
		this.description = "";
		this.variationQt = 0;
	}

	set price(val){
		this.variationPrice = Number(val);
	}

	get price(){
		return this.variationPrice;
	}

	set quantity(val){
		this.variationQt = Number(val);
	}

	get quantity(){
		return this.variationQt;
	}
}

module.exports = Variation;

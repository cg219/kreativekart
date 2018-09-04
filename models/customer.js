'use strict';

class Customer {
    constructor(data) {
        this.streetAddress = data && data.streetAddress || '';
        this.city = data && data.city || '';
        this.zipcode = data && data.zipcode || '';
        this.firstName = data && data.firstName || '';
        this.lastName = data && data.lastName || '';
        this.id = data && data.id || '';
    }

    get name() {
        return `${this.firstname} ${this.lastName}`;
    }
}

module.exports = Customer;

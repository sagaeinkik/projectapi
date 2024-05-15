'use strict';

const mongoose = require('mongoose');

//Schema
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Fyll i namn'],
    },
    category: {
        type: String,
        required: [true, 'Ange kategori'],
        enums: [
            'hot-bev',
            'cold-bev',
            'pastries',
            'cookies',
            'cakes',
            'salads',
            'sandwiches',
            'others',
        ],
    },
    price: {
        type: Number,
        required: [true, 'Ange pris'],
    },
});

const Product = mongoose.model('product', productSchema);

module.exports = Product;

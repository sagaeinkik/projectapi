'use strict';

const mongoose = require('mongoose');
const { escape } = require('validator');

//Schema
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Fyll i namn'],
    },
    category: {
        type: String,
        required: [true, 'Ange kategori'],
        enum: [
            'hot-bev',
            'cold-bev',
            'pastries',
            'cookies',
            'cakes',
            'salads',
            'sandwiches',
            'bread',
            'others',
        ],
    },
    description: {
        type: String,
        maxLength: 250,
    },
    price: {
        type: Number,
        required: [true, 'Ange pris'],
    },
});

//Gör om eventuella taggar till html-entities för att motverka xss
productSchema.pre('save', function (next) {
    this.name = escape(this.name);
    this.category = escape(this.category); //Ska inte behövas då det är enum men bara ifall
    next();
});

const Product = mongoose.model('product', productSchema);

module.exports = Product;

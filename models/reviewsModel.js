'use strict';

const mongoose = require('mongoose');
const { isEmail } = require('validator'); //Validera mailadress

const reviewSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Du måste ange ditt namn'],
    },
    email: {
        type: String,
        required: [true, 'Du måste ange din epost'],
        lowercase: true,
        validate: isEmail,
    },
    rating: {
        type: Number,
        required: [true, 'Ange betyg'],
        min: 0,
        max: 5,
    },
    comment: String,
    posted: {
        type: Date,
        default: Date.now(),
    },
    approved: {
        type: Boolean,
        default: false,
        required: true,
    },
});

const Review = mongoose.model('review', reviewSchema);

module.exports = Review;

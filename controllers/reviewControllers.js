'use strict';

const Review = require('../models/reviewsModel');

//ERROR-OBJEKT
let errors = {
    https_response: {
        message: '',
        code: '',
    },
    message: '',
    details: '',
};

//Funktion som nollställer error-objektet
function resetErrors() {
    //Loopa igenom alla nycklar i objektet
    Object.keys(errors).forEach((key) => {
        //Om det finns nested objects, loopa igenom dom också
        if (typeof errors[key] === 'object') {
            //Nollställ till tom sträng
            Object.keys(errors[key]).forEach((subKey) => {
                errors[key][subKey] = '';
            });
        } else {
            //Nollställ till tom sträng
            errors[key] = '';
        }
    });
}

//Hämta alla omdömen
module.exports.getReviews = async (req, res) => {
    resetErrors();
    try {
        //Lagra och sortera
        const result = await Review.find({}).sort({ posted: -1 });
        //felmeddelanden
        if (!result || result.length < 1) {
            errors.https_response.message = 'Not found';
            errors.https_response.code = 404;
            errors.message = 'No data to show';
            return res.json({ errors });
        }
        //Resultat
        return res.json({ result });
    } catch (error) {
        console.log('Något gick fel vid get /reviews: ' + error);
        return res.status(500).json({ error });
    }
};

//Hämta omdömen baserat på id

//Hämta omdömen baserat på ej gransad

//Hämta bara granskade omdömen

//Lägg till omdöme
module.exports.addReview = async (req, res) => {
    resetErrors();
    const { fullName, email, rating, comment } = req.body;

    try {
        const review = await Review.create({ fullName, email, rating, comment });
        return res.status(200).json({
            message: 'Review posted!',
            review,
        });
    } catch (error) {
        console.log('Något gick fel vid post /reviews: ' + error);

        //Felmeddelanden:
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ errors });
        }
        return res.status(400).json({ error });
    }
};

//Uppdatera omdöme - ändra granskad till true
module.exports.approveReview = async (req, res) => {
    resetErrors();

    const id = req.params.id;

    try {
        const updateReview = await Review.findByIdAndUpdate(id, { approved: true });

        if (!updateReview) {
            errors.https_response.message = 'Not found';
            errors.https_response.code = 404;
            errors.message = 'No data to show';

            return res.json({ errors });
        }
        return res.json({ message: 'Review approved successfully', updateReview });
    } catch (error) {
        console.log('Något gick fel vid put /reviews/:id : ' + error);
        return res.status(400).json({ error });
    }
};

//Radera omdöme

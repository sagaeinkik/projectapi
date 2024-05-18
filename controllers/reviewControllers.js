'use strict';

const Review = require('../models/reviewsModel');
const { createLog } = require('../models/logModel');

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
        return res.json(result);
    } catch (error) {
        console.log('Något gick fel vid get /reviews: ' + error);
        return res.status(500).json({ error });
    }
};

//Hämta omdömen baserat på id
module.exports.getReviewById = async (req, res) => {
    resetErrors();

    const id = req.params.id;
    //Hitta via id
    try {
        const result = await Review.findById(id);

        //Kolla resultat
        if (!result) {
            errors.https_response.message = 'Not found';
            errors.https_response.code = 404;
            errors.message = 'No data to show';
            return res.json({ errors });
        }
        //Resultat
        return res.json(result);
    } catch (error) {
        console.log('Någonting gick fel vid get /reviews/:id : ' + error);
        return res.status(400).json({ error });
    }
};

//Hämta omdömen baserat på ej gransad
module.exports.getUnapproved = async (req, res) => {
    resetErrors();

    //Hitta via approved: false
    try {
        const result = await Review.find({ approved: false });
        //Kolla resultat
        if (!result) {
            errors.https_response.message = 'Not found';
            errors.https_response.code = 404;
            errors.message = 'No data to show';
            return res.json({ errors });
        }
        //Resultat
        return res.json(result);
    } catch (error) {
        console.log('Någonting gick fel vid get /reviews/filter/unapproved: ' + error);
        return res.status(400).json({ error });
    }
};

//Hämta bara granskade omdömen
module.exports.getApproved = async (req, res) => {
    resetErrors();

    //Hitta via approved: true
    try {
        const result = await Review.find({ approved: true });
        //Kolla resultat
        if (!result) {
            errors.https_response.message = 'Not found';
            errors.https_response.code = 404;
            errors.message = 'No data to show';
            return res.json({ errors });
        }
        //Resultat
        return res.json(result);
    } catch (error) {
        console.log('Någonting gick fel vid get /reviews/filter/approved : ' + error);
        return res.status(400).json({ error });
    }
};

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
    //Review-id
    const id = req.params.id;
    // Hitta användarnamn från req om man är inloggad
    let username = req.username;
    if (!username) {
        username = 'DB-Lord';
    }

    try {
        const updateReview = await Review.findByIdAndUpdate(id, { approved: true });

        if (!updateReview) {
            errors.https_response.message = 'Not found';
            errors.https_response.code = 404;
            errors.message = 'No data to show';

            return res.json({ errors });
        }
        //Logga händelse
        await createLog('Review', updateReview._id, 'approved', username);
        //Resultat
        return res.json({ message: 'Review approved successfully', updateReview });
    } catch (error) {
        console.log('Något gick fel vid put /reviews/:id : ' + error);
        return res.status(400).json({ error });
    }
};

//Radera omdöme
module.exports.deleteReview = async (req, res) => {
    resetErrors();
    const id = req.params.id;
    // Hitta användarnamn från req om man är inloggad
    let username = req.username;
    if (!username) {
        username = 'DB-Lord';
    }
    try {
        const result = await Review.findByIdAndDelete(id);
        //Tomt resultat = felmeddelanden
        if (!result) {
            errors.https_response.message = 'Not found';
            errors.https_response.code = 404;
            errors.message = 'No data to show';
            errors.details = 'Post already deleted';
            return res.json({ errors });
        }
        await createLog('Review', result._id, 'deleted', username);
        return res.json({ message: 'Deleted id ' + id, result });
    } catch (error) {
        console.log('Något gick fel vid delete /reviews/:id : ' + error);
        return res.status(400).json({ error });
    }
};

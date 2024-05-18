'use strict';

const { Log } = require('../models/logModel');

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

module.exports.getLogs = async (req, res) => {
    //Hämta loggar men begränsa till de 15 senaste
    try {
        const logs = await Log.find({}).sort({ timestamp: -1 }).limit(15);
        if (!logs || logs.length < 1) {
            errors.https_response.code = 404;
            errors.https_response.message = 'Not found';
            errors.message = 'No data to show';
            return res.json({ errors });
        }
        //Annars, skicka tillbaka resultat
        return res.status(200).json(logs);
    } catch (error) {
        console.log('Något gick fel vid get /logs: ' + error);
        return res.status(500).json({ error });
    }
};

'use strict';
//Importer
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { createLog } = require('../models/logModel');
//Skapa web token
const expirationDate = 60 * 60 * 3; //Tre timmar
function createToken(username) {
    return jwt.sign({ username }, process.env.JWT_SECRET_KEY, { expiresIn: expirationDate });
}

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

//Registrera ny användare
module.exports.registerUser = async (req, res) => {
    resetErrors();

    // req-innehåll:
    const { username, email, password } = req.body;

    try {
        //Kolla om användare redan finns, ge error då
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            errors.https_response.code = 400;
            errors.https_response.message = 'Bad request';
            errors.message = 'En användare finns redan med detta användarnamn och/eller e-post.';
            return res.status(400).json({ errors });
        }

        //Skapa annars ny användare med hjälp av req-bodyn
        const user = await User.create({ username, email, password });
        //skapa en token för inloggning direkt
        const token = createToken(user.username);
        res.status(200).json({
            message: 'User created',
            user: { username: user.username, email: user.email },
            token,
        });
        await createLog('Users', user._id, 'User added', 'DB-Lord');
    } catch (error) {
        console.log('Något gick fel vid post signup: ' + error);

        // Hantera valideringsfel och returnera individuella felmeddelanden
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ errors });
        }
        return res.status(400).json({ error });
    }
};

//Logga in användare
module.exports.login = async (req, res) => {
    resetErrors();
    //Lagra inloggningsuppgifterna
    const { username, password } = req.body;

    try {
        //använd login-metoden från userModel
        const user = await User.login(username, password);
        //Skapa token
        const token = createToken(user.username);
        res.status(200).json({
            message: 'User logged in',
            user: { username: user.username, email: user.email },
            token,
        });
    } catch (error) {
        console.log('Något gick fel vid post loginUser: ' + error);

        // Kontrollera om felet är användarnamn eller lösenord
        if (error instanceof Error && error.message === 'Felaktigt användarnamn eller lösenord') {
            errors.https_response.code = 400;
            errors.https_response.message = 'Bad request';
            errors.message = 'Felaktigt användarnamn eller lösenord';
            return res.status(400).json({ errors });
        } else {
            // Annars, generellt felmeddelande
            return res.status(400).json({ error });
        }
    }
};

//Tokenvalidering
module.exports.authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; //Själva token utan ord

    if (!token) return res.status(401).json({ message: 'Unauthorized, missing token' });

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: 'Unauthorized, invalid token' });

        req.username = user.username;
        next();
    });
};

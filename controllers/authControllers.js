'use strict';
//Importer
const User = require('../models/userModel');
const Product = require('../models/productModel');
const jwt = require('jsonwebtoken');
require('dotenv').config();

//Skapa web token
const expirationDate = 60 * 60 * 3; //Tre timmar
function createToken(username) {
    return jwt.sign({ username }, process.env.JWT_SECRET_KEY, { expiresIn: expirationDate });
}

//Hämta alla producter
module.exports.getProducts = async (req, res) => {
    //kod här
};

//Registrera ny användare
module.exports.registerUser = async (req, res) => {
    //Error-meddelanden
    let errors = {
        https_response: {
            message: '',
            code: '',
        },
        message: '',
        details: '',
    };

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
    //Error-meddelanden
    let errors = {
        https_response: {
            message: '',
            code: '',
        },
        message: '',
        details: '',
    };
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

// Lägg till ny produkt i Menyn
module.exports.addProduct = async (req, res) => {
    //Error-meddelanden
    let errors = {
        https_response: {
            message: '',
            code: '',
        },
        message: '',
        details: '',
    };
    const { name, category, price } = req.body;

    try {
        const product = await Product.create({ name, category, price });
        res.status(200).json({
            message: 'Ny produkt tillagd!',
            product,
        });
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

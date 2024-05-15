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

//Hämta alla produkter
module.exports.getProducts = async (req, res) => {
    resetErrors();
    try {
        const result = await Product.find({});
        //Felmeddelande om inga resultat
        if (!result) {
            errors.https_response.code = 404;
            errors.https_response.message = 'Not found';
            errors.message = 'No data to show';
            return res.json({ errors });
        }
        //Annars, skicka tillbaka resultat
        res.status(200).json(result);
    } catch (error) {
        console.log('Något gick fel vid get /products: ' + error);
        return res.status(500).json({ error });
    }
};

//Hämta specifik produkt med hjälp av id
module.exports.getProductById = async (req, res) => {
    resetErrors();
    const id = req.params.id;
    //kod här
    try {
        const result = await Product.findById(id);
        //Felmeddelande om inga resultat
        if (!result) {
            errors.https_response.code = 404;
            errors.https_response.message = 'Not found';
            errors.message = 'No data to show';
            return res.json({ errors });
        }
        res.status(200).json(result);
    } catch (error) {
        console.log('Något gick fel vid get /products/:id : ' + error);
        return res.status(500).json({ error });
    }
};

//Hämta specifik produkt med hjälp av produktnamn
module.exports.getProductByName = async (req, res) => {
    resetErrors();
    //Produktnamn
    const name = req.params.name;
    let decodedName = decodeURIComponent(name);

    try {
        const result = await Product.find({ name: { $regex: new RegExp('^' + decodedName, 'i') } });
        if (!result || result.length < 1) {
            errors.https_response.message = 'Not found';
            errors.https_response.code = 404;
            errors.message = 'No data to show';
            return res.json({ errors });
        } else {
            //Visa resultat
            return res.json({ result });
        }
    } catch (error) {
        console.log('Något gick fel vid get products/name/:name');
        return res.status(500).json({ error });
    }
};

// Lägg till ny produkt i Menyn
module.exports.addProduct = async (req, res) => {
    resetErrors();

    const { name, category, price } = req.body;

    try {
        const product = await Product.create({ name, category, price });
        res.status(200).json({
            message: 'Ny produkt tillagd!',
            product,
        });
    } catch (error) {
        console.log('Något gick fel vid post /products: ' + error);

        // Hantera valideringsfel och returnera individuella felmeddelanden
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ errors });
        }
        return res.status(400).json({ error });
    }
};

//Ändra en produkt
module.exports.editProduct = async (req, res) => {
    resetErrors();
    const id = req.params.id;
    try {
        let updatedProduct = await Product.findByIdAndUpdate(id, req.body);

        if (!updatedProduct) {
            errors.https_response.message = 'Not found';
            errors.https_response.code = 404;
            errors.message = 'No data to show';
            return res.json({ errors });
        } else {
            return res.json({ message: 'Product updated successfully', updatedProduct });
        }
    } catch (error) {
        console.log('Något gick fel vid put /products/:id : ' + error);

        // Hantera valideringsfel och returnera individuella felmeddelanden
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ errors });
        }
        return res.status(400).json({ error });
    }
};

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

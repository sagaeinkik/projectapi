'use strict';

//Importer
const Product = require('../models/productModel');

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
    //Nollställ error
    resetErrors();
    try {
        const result = await Product.find({}).sort({ category: 1 });
        //Felmeddelande om inga resultat
        if (!result) {
            errors.https_response.code = 404;
            errors.https_response.message = 'Not found';
            errors.message = 'No data to show';
            return res.json({ errors });
        }
        //Annars, skicka tillbaka resultat
        return res.status(200).json(result);
    } catch (error) {
        console.log('Något gick fel vid get /products: ' + error);
        return res.status(500).json({ error });
    }
};

//Hämta specifik produkt med hjälp av id
module.exports.getProductById = async (req, res) => {
    resetErrors();
    const id = req.params.id;
    //Försök hitta dokument med ID
    try {
        const result = await Product.findById(id);
        //Felmeddelande om inga resultat
        if (!result) {
            errors.https_response.code = 404;
            errors.https_response.message = 'Not found';
            errors.message = 'No data to show';
            return res.json({ errors });
        }
        //Annars resultat
        return res.status(200).json(result);
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
    //Försök hitta via namn, uri-kodat
    try {
        const result = await Product.find({ name: { $regex: new RegExp('^' + decodedName, 'i') } });
        //Felmeddelande om inga resultat
        if (!result || result.length < 1) {
            errors.https_response.message = 'Not found';
            errors.https_response.code = 404;
            errors.message = 'No data to show';
            return res.json({ errors });
        }
        //Visa resultat
        return res.json({ result });
    } catch (error) {
        console.log('Något gick fel vid get products/name/:name');
        return res.status(500).json({ error });
    }
};

//Hämta alla produkter i specifik kategori
module.exports.getProductsByCategory = async (req, res) => {
    resetErrors();
    //Kategori-namn från URL
    const category = req.params.category;
    let decodedCategory = decodeURIComponent(category);
    //Försök hitta category
    try {
        const result = await Product.find({
            category: { $regex: new RegExp('^' + decodedCategory, 'i') },
        });
        //Felmeddelande om tomt resultat
        if (!result || result.length < 1) {
            errors.https_response.message = 'Not found';
            errors.https_response.code = 404;
            errors.message = 'No data to show';
            return res.json({ errors });
        }
        //Visa resultat
        return res.json({ result });
    } catch (error) {
        console.log('Något gick fel vid get products/category/:category');
        return res.status(500).json({ error });
    }
};

// Lägg till ny produkt i Menyn
module.exports.addProduct = async (req, res) => {
    resetErrors();
    //Värdena som skickas med i anropet
    const { name, category, price } = req.body;
    //Skapa nytt dokument i products-collection
    try {
        const product = await Product.create({ name, category, price });
        return res.status(200).json({
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
    //Hitta id
    const id = req.params.id;
    //Hitta och uppdateera enligt id
    try {
        let updatedProduct = await Product.findByIdAndUpdate(id, req.body);
        //Om tomt resultat, felmeddelande
        if (!updatedProduct) {
            errors.https_response.message = 'Not found';
            errors.https_response.code = 404;
            errors.message = 'No data to show';
            return res.json({ errors });
        }
        //Resultat
        return res.json({ message: 'Product updated successfully', updatedProduct });
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

//Radera en produkt
module.exports.deleteProduct = async (req, res) => {
    resetErrors();
    const id = req.params.id;
    //Hitta och radera enligt ID
    try {
        const result = await Product.findByIdAndDelete(id);
        //Tomt resultat = felmeddelanden
        if (!result) {
            errors.https_response.message = 'Not found';
            errors.https_response.code = 404;
            errors.message = 'No data to show';
            errors.details = 'Post already deleted';
            return res.json({ errors });
        }
        return res.status(200).json({ result });
    } catch (error) {
        console.log('Något gick fel vid delete /products/:id : ' + error);
        return res.status(500).json({ error });
    }
};

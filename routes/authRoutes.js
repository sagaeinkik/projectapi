'use strict';

//Skaffa router
const { Router } = require('express');
const router = Router();

//Funktionerna
const authController = require('../controllers/authControllers');
const productController = require('../controllers/productControllers');

/* ROUTES */
router.get('/products', productController.getProducts); //alla produkter
router.get('/products/:id', productController.getProductById); //Specifik produkt (id)
router.get('/products/product/:name', productController.getProductByName); //specifik produkt (namn)
router.get('/products/category/:category', productController.getProductsByCategory); //Alla produkter i specifik kategori
router.post('/products', productController.addProduct); //Lägg till produkt
router.put('/products/:id', productController.editProduct); //Uppdatera produkt
router.delete('/products/:id', productController.deleteProduct); //Radera produkt

router.post('/signup', authController.registerUser); //Lägg till ny användare
router.post('/login', authController.login); //Logga in befintlig användare

//Exportera
module.exports = router;

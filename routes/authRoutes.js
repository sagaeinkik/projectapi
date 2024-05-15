'use strict';

//Skaffa router
const { Router } = require('express');
const router = Router();

//Funktionerna
const authController = require('../controllers/authControllers');

/* ROUTES */
router.get('/products', authController.getProducts); //alla produkter
router.get('/products/:id', authController.getProductById); //Specifik produkt (id)
router.get('/products/product/:name', authController.getProductByName); //specifik produkt (namn)
router.post('/products', authController.addProduct); //Lägg till produkt
router.put('/products/:id', authController.editProduct); //Uppdatera produkt

router.post('/signup', authController.registerUser); //Lägg till ny användare
router.post('/login', authController.login); //Logga in befintlig användare

//Exportera
module.exports = router;

'use strict';

//Skaffa router
const { Router } = require('express');
const router = Router();

//Funktionerna
const authController = require('../controllers/authControllers');

/* ROUTES */
//Produkter
router.get('/products', authController.getProducts);
router.post('/products', authController.addProduct);
router.get('/products/:id', authController.getProductById);
router.get('/products/product/:name', authController.getProductByName);

router.post('/signup', authController.registerUser);
router.post('/login', authController.login);

//Exportera
module.exports = router;

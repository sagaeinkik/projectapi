'use strict';

//Skaffa router
const { Router } = require('express');
const router = Router();

//Funktionerna
const authController = require('../controllers/authControllers');
const productController = require('../controllers/productControllers');
const reviewController = require('../controllers/reviewControllers');
const logController = require('../controllers/logControllers');

/* ROUTES */

//Products
router.get('/products', productController.getProducts); //alla produkter
router.get('/products/:id', productController.getProductById); //Specifik produkt (id)
router.get('/products/product/:name', productController.getProductByName); //specifik produkt (namn)
router.get('/products/category/:category', productController.getProductsByCategory); //Alla produkter i specifik kategori
router.post('/products', authController.authenticateToken, productController.addProduct); //Lägg till produkt
router.put('/products/:id', authController.authenticateToken, productController.editProduct); //Uppdatera produkt
router.delete('/products/:id', authController.authenticateToken, productController.deleteProduct); //Radera produkt

//Reviews
router.get('/reviews', reviewController.getReviews); //Hämta alla omdömen
router.get('/reviews/:id', reviewController.getReviewById); //Hämta specifikt omdöme
router.get('/reviews/filter/unapproved', reviewController.getUnapproved); //Hämta omdömen som inte är granskade ännu
router.get('/reviews/filter/approved', reviewController.getApproved); //Hämta omdömen som är granskade
router.post('/reviews', reviewController.addReview); //Lägg till omdöme
router.put('/reviews/:id', authController.authenticateToken, reviewController.approveReview); //Ändra omdöme till approved: true
router.delete('/reviews/:id', authController.authenticateToken, reviewController.deleteReview); //Radera

//Users
router.post('/signup', authController.registerUser); //Lägg till ny användare
router.post('/login', authController.login); //Logga in befintlig användare
//skyddad route
router.get('/protected', authController.authenticateToken, (req, res) => {
    res.json({ message: 'Access granted', username: req.username });
});

//Logg
router.get('/logs', logController.getLogs);
//Exportera
module.exports = router;

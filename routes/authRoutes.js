'use strict';

//Skaffa router
const { Router } = require('express');
const router = Router();

//Funktionerna
const authController = require('../controllers/authControllers');

//Routes
router.post('/signup', authController.registerUser);
router.post('/login', authController.login);

//Exportera
module.exports = router;

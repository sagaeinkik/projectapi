'use strict';

//Importera
const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const jwt = require('jsonwebtoken');

//Parsing
app.use(cors());
app.use(express.json());

//Port
const port = process.env.PORT || 3000;

//Starta applikation
app.listen(port, (error) => {
    if (error) {
        console.log('Fel vid start av applikation: ' + error);
    } else {
        console.log('Startad på port ' + port);
    }
});

'use strict';

//Importera
const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/authRoutes');
const mongoSanitize = require('express-mongo-sanitize');

//Parsing
app.use(cors());
app.use(express.json());
//Skydda lite mot NoSQL injections
app.use(
    mongoSanitize({
        allowDots: true,
    })
);

//Port
const port = process.env.PORT || 3000;

//Anslut till databas
const dbUrl = process.env.DB_URL;
mongoose
    .connect(dbUrl)
    .then(() => {
        console.log('Ansluten till MongoDB!');
    })
    .catch((error) => {
        console.log('Fel vid anslutning av databas: ' + error);
    });

/* ROUTES */
//Middleware
app.use(authRoutes);
//Välkomstroute
app.get('/', (req, res) => {
    res.json({
        message:
            'Det här är Saga Kikajons API för projektet för Backendbaserad webbutveckling på Mittuniversitetet. Du hittar instruktioner för användning på mitt github-repo, https://github.com/sagaeinkik/projectapi',
    });
});

//Starta applikation
app.listen(port, (error) => {
    if (error) {
        console.log('Fel vid start av applikation: ' + error);
    } else {
        console.log('Startad på port ' + port);
    }
});

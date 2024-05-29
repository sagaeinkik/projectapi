'use strict';

const mongoose = require('mongoose');

//Schema för logga händelser
const logSchema = new mongoose.Schema({
    collectionName: String,
    documentId: mongoose.Schema.Types.ObjectId,
    action: String,
    timestamp: { type: Date, default: Date.now },
    username: String,
});

//Funktion som loggar
async function createLog(collectionName, documentId, action, username) {
    try {
        const log = new Log({
            collectionName,
            documentId,
            action,
            username,
        });
        await log.save();
    } catch (error) {
        console.error('Error creating log:', error);
    }
}

const Log = mongoose.model('log', logSchema);

module.exports = { createLog, Log };

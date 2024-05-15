'use strict';
//Importer

const mongoose = require('mongoose');
const { isEmail, escape } = require('validator'); //Validera mailadress
const bcrypt = require('bcrypt'); //Kryptera lösenord

//Schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Ange ett användarnamn'],
        unique: [true, 'Detta användarnamn är upptaget'],
    },
    email: {
        type: String,
        required: [true, 'Ange en mailadress'],
        unique: [true, 'Denna mailadress är upptagen'],
        lowercase: true,
        validate: isEmail,
    },
    password: {
        type: String,
        required: [true, 'Ange ett lösenord'],
        minLength: [6, 'Ditt lösenord måste vara minst 6 tecken långt'],
    },
});

//Gör om eventuella taggar till html-entities för att motverka xss
userSchema.pre('save', function (next) {
    this.username = escape(this.username);
    this.email = escape(this.email);
    this.password = escape(this.password);
    next();
});

//Kryptera lösenord
userSchema.pre('save', async function (next) {
    try {
        if (this.isNew || this.isModified('password')) {
            const hashedPassword = await bcrypt.hash(this.password, 10);
            this.password = hashedPassword;
        }

        next();
    } catch (error) {
        next(error);
    }
});

//Statisk metod för att logga in användare
userSchema.statics.login = async function (username, password) {
    //Hitta använare
    const user = await this.findOne({ username });
    if (user) {
        //Jämför lösenord
        const authorized = await bcrypt.compare(password, user.password);

        if (authorized) {
            //Returnera användare om lyckat
            return user;
        }
        //Error för fel lösenord
        throw Error('Felaktigt användarnamn eller lösenord');
    }
    //Error för fel användare
    throw Error('Felaktigt användarnamn eller lösenord');
};

const User = mongoose.model('user', userSchema);

module.exports = User;

require('dotenv').config()

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const app = express();

app.use(session({
    secret: 'harvey', // Replace with a secure and unique key
    resave: false,              // Don't save session if unmodified
    saveUninitialized: true,    // Save uninitialized sessions
    cookie: { secure: false }   // Set to true if using HTTPS
}));

app.use(cors())
app.use(express.json())


async function start() {
    try {
        await mongoose.connect('mongodb://localhost:27017/revision')
        console.log('Database connected successfully');
        app.listen(4000, () => {
            console.log('App on port 4000')
        })
    } catch (error) {
        console.error('Database connection failed', error);
    }
}


start();



const account = require('./route/account')
const flashcard = require('./route/flashcard')
const todo = require('./route/todo')
const payment = require('./route/payment')

app.use('/account', account)
app.use('/flashcard', flashcard)
app.use('/todo', todo)
app.use('/payment',payment)
const express = require('express');
const account = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../model/user');
const verifyToken = require('../middleware/verifyToken');
const verifyPaid = require('../middleware/verifyPaid');


account.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Fields are missing' });
        }

        const existingUser = await User.findOne({ email: email })

        if(existingUser) {
            return res.status(401).json('User already exists')
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            email,
            password: hashedPassword,
            name
        });

        const savedUser = await newUser.save();

        // Generate a JWT token with a payload containing non-sensitive user information
        const jwtPayload = {
            userId: savedUser._id,
            email: savedUser.email,
            name: savedUser.name,
            // Add any other non-sensitive information here
        };

        const token = jwt.sign(jwtPayload, process.env.JWT_PRIVATE, { expiresIn: '365d' });

        res.status(201).json({ message: 'Registration successful', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

account.post('/login', async (req,res) => {
    try{
        const { email, password } = req.body;

        console.log(email, password)

        if(!email) {
            return res.status(404).json({error: 'Fields are missing'})
        }

        const foundUser = await User.findOne({email: email})

        if(!foundUser) {
            return res.status(404).json({error: `User ${email} was not found`})
        }

        const passwordMatch = await bcrypt.compare(password, foundUser.password)

        if(!passwordMatch) {
            return res.status(404).json({ error: 'Password is incorrect'})
        }

        const tokenPayload = {
            email: foundUser.email,
            name: foundUser.name
        }

        const token = jwt.sign(tokenPayload, process.env.JWT_PRIVATE, { expiresIn: '365d' });

        res.json({message: 'Login Successfully', token: token, Payload: tokenPayload})

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });        
    }
})

account.post('/delete', verifyToken, async (req, res) => {
    try {
        const { email } = req.user;

        // Find the user by email
        const userToDelete = await User.findOne({ email });

        if (!userToDelete) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Delete the user
        const deletedUser = await User.findOneAndDelete({ email });

        // You might want to check if deletedUser is null, indicating no user was found with that email.

        res.status(200).json({ message: 'User deleted successfully', deletedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


account.post('/dashboard', verifyToken, verifyPaid, async (req, res) => {
    try {
        // Access the decoded data from the JWT
        const { email, name } = req.user;
        
        // Logging email and name from the decoded JWT
        console.table({
            email: email,
            name: name
        });


        const user = await User.findOne({ email: email });
        
        if (user) {
            res.status(200).json({ User: user, isLoggedIn: true });
        } else {
            // User not found in the database
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error in /dashboard route:', error);
        // Handle any unexpected errors
        res.status(500).json({ error: 'Internal server error' });
    }
});


account.post('/usage',verifyToken, async (req,res) => {
    const email = req.user.email
    try {
        const findUsage = await User.findOne({email: email})


        res.json(cardsUsed.cardsAmount)
    } catch (error) {

    }
})

module.exports = account;
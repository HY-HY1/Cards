const express = require('express');
const route = express.Router({ mergeParams: true });
const verifyToken = require('../middleware/verifyToken');
const Flashcard = require('../model/flashcard');

// Get all stacks for the subject
route.get('/stacks', verifyToken, async (req, res) => {
    try {
        const email = req.user.email;
        const { subject } = req.params; // Automatically retrieved from parent

        const flashcard = await Flashcard.findOne({ email: email, subject: subject });

        if (!flashcard) {
            return res.status(404).json({ success: false, message: 'Subject not found.' });
        }

        res.json({ success: true, stacks: flashcard.stacks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Create a new stack inside the subject
route.post('/stacks/create', verifyToken, async (req, res) => {
    try {
        const email = req.user.email;
        const { subject } = req.params;
        const { name } = req.body;

        console.log(req.body)

        const flashcard = await Flashcard.findOne({ email: email, subject: subject });

        if (!flashcard) {
            return res.status(404).json({ success: false, message: 'Subject not found.' });
        }

        const existingStack = flashcard.stacks.find(stack => stack.name === name);

        if (existingStack) {
            return res.status(400).json({ success: false, message: 'Stack already exists in this subject.' });
        }

        flashcard.stacks.push({ name: name, flashcards: [] });

        await flashcard.save();
        res.json({ success: true, flashcard });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

route.delete('/:stack', verifyToken, async (req,res) => {
    try {
        const stack = req.params()
        const email = req.user.email

        const findStack = await Flashcard.findOne({email: email, subject: subject})

        if(!findStack) {
            return res.status(404).json({error: "stack not found"})
        }

        await Flashcard.deleteOne({email: email, stack: stack})

        res.status(200).json({success: true, massage: `${stack} Successfully Deleted`})


    } catch (error) {

    }
})


// Use the stack routes
const stackRoutes = require('../route/stack');
route.use('/stacks/:stack', stackRoutes);

module.exports = route;

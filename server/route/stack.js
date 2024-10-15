const express = require('express');
const route = express.Router({ mergeParams: true });
const verifyToken = require('../middleware/verifyToken');
const Flashcard = require('../model/flashcard');
const User = require('../model/user');

// Get all flashcards inside a specific stack
route.get('/', verifyToken, async (req, res) => {
    try {
        const email = req.user.email;
        const { subject, stack } = req.params; // Retrieve subject and stack from URL params

        // Find the flashcard document for the user's email and subject
        const flashcard = await Flashcard.findOne({ email: email, subject: subject });

        if (!flashcard) {
            return res.status(404).json({ success: false, message: 'Subject not found.' });
        }

        const foundStack = flashcard.stacks.find(s => s.name === stack);

        if (!foundStack) {
            return res.status(404).json({ success: false, message: 'Stack not found.' });
        }

        res.json({ success: true, flashcards: foundStack.flashcards });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Create a new flashcard in a specific stack
route.post('/create', verifyToken, async (req, res) => {
    try {
        const email = req.user.email;
        const { subject, stack } = req.params;
        const { question, answer } = req.body;

        const flashcard = await Flashcard.findOne({ email: email, subject: subject });

        if (!flashcard) {
            return res.status(404).json({ success: false, message: 'Subject not found.' });
        }

        const foundStack = flashcard.stacks.find(s => s.name === stack);

        if (!foundStack) {
            return res.status(404).json({ success: false, message: 'Stack not found.' });
        }

        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Check if the user has reached the free tier limit
        if (user.cardsAmount >= process.env.FreeLimit && !user.isPaid) {
            return res.status(403).json({ success: false, message: 'User has reached the free tier limit.' });
        }

        // Check if a flashcard with the same question already exists in the stack
        const duplicateCard = foundStack.flashcards.find(flashcard => flashcard.question === question);
        if (duplicateCard) {
            return res.status(409).json({ success: false, message: 'Flashcard with this question already exists in the stack.' });
        }

        // If no duplicate exists, create the new flashcard
        foundStack.flashcards.push({ question, answer });

        await flashcard.save();

        // Increment user's card count
        user.cardsAmount += 1;
        await user.save();

        res.json({ success: true, flashcard });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Delete a flashcard from a specific stack
route.delete('/', verifyToken, async (req, res) => {
    try {
        const { subject, stack } = req.params;
        const { question } = req.body;
        const email = req.user.email;

        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const flashcard = await Flashcard.findOne({ email: email, subject: subject });
        if (!flashcard) {
            return res.status(404).json({ success: false, message: 'Subject not found.' });
        }

        const foundStack = flashcard.stacks.find(s => s.name === stack);
        if (!foundStack) {
            return res.status(404).json({ success: false, message: 'Stack not found.' });
        }

        const initialLength = foundStack.flashcards.length;
        foundStack.flashcards = foundStack.flashcards.filter(fc => fc.question !== question);

        if (foundStack.flashcards.length === initialLength) {
            return res.status(404).json({ success: false, message: 'Flashcard not found.' });
        }

        await flashcard.save();

        user.cardsAmount -= 1;
        await user.save();

        res.json({ success: true, message: 'Flashcard deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

module.exports = route;

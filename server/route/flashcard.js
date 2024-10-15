const express = require('express');
const route = express.Router();
const verifyToken = require('../middleware/verifyToken');
const Flashcard = require('../model/flashcard');
const User = require('../model/user')

// Get all subjects for the user
route.get('/', verifyToken, async (req, res) => {
    try {
        const email = req.user.email;
        const flashcards = await Flashcard.find({ email: email });

        if (!flashcards.length) {
            return res.status(200).json({ error: 'No flashcards found', email: email });
        }

        console.log('email', email)

        res.json(flashcards);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Create a new subject
route.post('/create', verifyToken, async (req, res) => {
    try {
        const { subject } = req.body;
        const email = req.user.email;

        // Find the existing subject
        const existingSubject = await Flashcard.findOne({ email: email, subject: subject });

        if (existingSubject) {
            return res.status(400).json({ success: false, message: 'Subject already exists for this user.' });
        }

        // Create a new subject with an empty stack
        const newSubject = new Flashcard({
            email: email,
            subject: subject,
            stacks: [] // Initialize with an empty stack
        });

        // Save the new subject
        await newSubject.save();

        res.json({ success: true, newSubject, cardsAmount: user.cardsAmount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
  

route.delete('/:subject', verifyToken, async (req, res) => {
    try {
      const { subject } = req.params;
      const email = req.user.email;
  
      // Find the subject by email and subject name
      const findExisting = await Flashcard.findOne({ email: email, subject: subject });
  
      if (!findExisting) {
        return res.status(404).json({ error: 'Subject not found' }); // Use 404 for "not found"
      }
  
      // Delete the subject
      await Flashcard.deleteOne({ email: email, subject: subject });
  
      // Send success response
      res.status(200).json({ success: true, message: 'Subject deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' }); // Use 500 status code for server errors
    }
  });

  

// Use the subject routes
const subjectRoutes = require('../route/subject');
route.use('/:subject', subjectRoutes);

module.exports = route;

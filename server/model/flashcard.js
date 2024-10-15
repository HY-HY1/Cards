const mongoose = require('mongoose');

// Define the flashcard schema for each stack
const flashcardSchema = new mongoose.Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Define the stack schema
const stackSchema = new mongoose.Schema({
    name: { type: String, required: true },
    flashcards: [flashcardSchema] // Array of flashcards
});

// Define the subject schema
const subjectSchema = new mongoose.Schema({
    email: { type: String, required: true },
    subject: { type: String, required: true },
    stacks: [stackSchema],
    createdAt: { type: Date, default: Date.now }
});

const FlashcardModel = mongoose.model('Flashcards', subjectSchema);

module.exports = FlashcardModel;

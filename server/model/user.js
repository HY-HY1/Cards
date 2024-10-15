const mongoose = require('mongoose');

// Define the User schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,   // The name is required
        trim: true        // Trims any whitespace from the name
    },
    email: {
        type: String,
        required: true,   // The email is required
        unique: true,     // Each email must be unique
        lowercase: true,  // Converts the email to lowercase before saving
        trim: true        // Trims any whitespace from the email
    },
    password: {
        type: String,
        required: true    // The password is required
    },
    cardsAmount: {
        type: Number,
        required: true,
        default: 0   
    },
    isPaid: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now // Automatically set the created date
    }
    
});

// Create and export the User model
const User = mongoose.model('User', userSchema);

module.exports = User;

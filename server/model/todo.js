const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema(
    {
        _id: ObjectId,  // MongoDB Object ID
        userId: ObjectId,  // Reference to the user who created the todo
        title: {
          type: String,
          required: true,  // Todo item title
          minlength: 1,
          maxlength: 100
        },
        description: {
          type: String,
          maxlength: 500  // Optional description
        },
        priority: {
          type: String,
          enum: ['low', 'medium', 'high'],
          default: 'medium'  // Priority level of the todo
        },
        status: {
          type: String,
          enum: ['pending', 'in progress', 'completed', 'archived'],
          default: 'pending'  // Status of the todo
        },
        dueDate: {
          type: Date,  // Optional due date for the todo
          default: null
        },
        createdAt: {
          type: Date,
          default: Date.now,  // Auto-generated creation date
          immutable: true
        },
        updatedAt: {
          type: Date,
          default: Date.now,  // Auto-generated last updated date
        },
        tags: [
          {
            type: String,
            maxlength: 50  // Optional tags for categorizing todos
          }
        ],
        isRecurring: {
          type: Boolean,
          default: false  // Whether the todo is recurring
        },
        recurrence: {
          interval: {
            type: String,
            enum: ['daily', 'weekly', 'monthly', 'yearly'],
            default: null  // Frequency of recurrence
          },
          count: {
            type: Number,
            default: null  // Optional, how many times it should repeat
          },
          endDate: {
            type: Date,  // Optional end date for recurrence
            default: null
          }
        },
        relatedFlashcards: [
          {
            type: ObjectId,
            ref: 'Flashcard',  // Links to flashcards related to the todo
            required: false
          }
        ],
        completedAt: {
          type: Date,  // Timestamp when the task is completed
          default: null
        },
        reminders: [
          {
            reminderDate: {
              type: Date,  // Date and time of the reminder
              required: true
            },
            message: {
              type: String,  // Custom message for the reminder
              default: "Reminder for your task!"  // Default reminder message
            },
            isSent: {
              type: Boolean,
              default: false  // Flag to check if reminder has been sent
            }
          }
        ]
      }
      
)

const schema = mongoose.model('todo', todoSchema)

module.exports = schema
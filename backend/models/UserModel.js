const mongoose = require("mongoose");

// Subschema for the image, question, answer objects
const sessionItemSchema = new mongoose.Schema({
    image: {
        type: Buffer,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    }
});

// Main user schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    sessions: [[sessionItemSchema]]  // Array of sessions
});

module.exports = mongoose.model("users", userSchema);

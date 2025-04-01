const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number }, // Optional, add required: true if needed
    gender: { type: String, enum: ['male', 'female', 'other'] },
    nationality: { type: String },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);

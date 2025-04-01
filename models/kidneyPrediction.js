const mongoose = require('mongoose');

const KidneyDiseasePredictionSchema = new mongoose.Schema({
  
  email: { type: String },
  mobileNumber: { type: String },
  age: { type: Number, required: true },
  bp: { type: Number, required: true },
  sg: { type: Number, required: true },
  al: { type: Number, required: true },
  su: { type: Number, required: true },
  // Add more fields if needed, e.g., blood urea, creatinine, etc.
  predictedResult: { type: String },
  probability: { type: Number }
}, { timestamps: true  ,  collection: 'kidneydiseasepredictions' });

module.exports = mongoose.model('KidneyDiseasePrediction', KidneyDiseasePredictionSchema);

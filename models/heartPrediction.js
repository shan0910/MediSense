const mongoose = require('mongoose');

const HeartDiseasePredictionSchema = new mongoose.Schema({
 
  email: { type: String },
  mobileNumber: { type: String },
  age: { type: Number, required: true },
  sex: { type: Number, required: true },
  cp: { type: Number, required: true },
  trestbps: { type: Number, required: true },
  chol: { type: Number, required: true },
  fbs: { type: Number, required: true },
  restecg: { type: Number, required: true },
  thalach: { type: Number, required: true },
  exang: { type: Number, required: true },
  oldpeak: { type: Number, required: true },
  slope: { type: Number, required: true },
  ca: { type: Number, required: true },
  thal: { type: Number, required: true },
  predictedResult: { type: String },
  probability: { type: Number }
}, { timestamps: true  ,  collection: 'heartdiseasepredictions' });

module.exports = mongoose.model('HeartDiseasePrediction', HeartDiseasePredictionSchema);

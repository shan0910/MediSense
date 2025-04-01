const mongoose = require('mongoose');

const DiabetesPredictionSchema = new mongoose.Schema({
 
  // You can also store email or phone if needed:
  email: { type: String , required: true,index: true},
  phoneNumber: { type: String, required: true,index: true},
  pregnancies: { type: Number, required: true },
  glucose: { type: Number, required: true },
  bloodPressure: { type: Number, required: true },
  skinThickness: { type: Number, required: true },
  insulin: { type: Number, required: true },
  bmi: { type: Number, required: true },
  diabetesPedigreeFunction: { type: Number, required: true },
  age: { type: Number, required: true },
  predictedResult: { type: String },
  probability: { type: Number }
}, { timestamps: true ,  collection: 'diabetesdiseasepredictions' });

module.exports = mongoose.model('DiabetesPrediction', DiabetesPredictionSchema);

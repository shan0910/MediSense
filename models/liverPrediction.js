const mongoose = require('mongoose');

const LiverDiseasePredictionSchema = new mongoose.Schema({

  email: { type: String },
  mobileNumber: { type: String },
  Age: { type: Number, required: true },
  Gender: { type: String, required: true },
  Total_Bilirubin: { type: Number, required: true },
  Direct_Bilirubin: { type: Number, required: true },
  Alkaline_Phosphotase: { type: Number, required: true },
  Alamine_Aminotransferase: { type: Number, required: true },
  Aspartate_Aminotransferase: { type: Number, required: true },
  Total_Protiens: { type: Number, required: true },
  Albumin: { type: Number, required: true },
  Albumin_and_Globulin_Ratio: { type: Number, required: true },
  predictedResult: { type: String },
  probability: { type: Number }
}, { timestamps: true,
  collection: 'liverdiseasepredictions' 
 });

module.exports = mongoose.model('LiverDiseasePrediction', LiverDiseasePredictionSchema);

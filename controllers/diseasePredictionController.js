const { PythonShell } = require('python-shell');
const path = require('path');

const DiabetesPrediction = require('../models/diabetesPrediction');
const HeartDiseasePrediction = require('../models/heartPrediction');
const LiverDiseasePrediction = require('../models/liverPrediction');
const KidneyDiseasePrediction = require('../models/kidneyPrediction');

/**
 * Utility function to run a Python script and return its output as JSON.
 */
const runPythonScript = async (scriptName, inputData) => {
  return new Promise((resolve, reject) => {
    const options = {
      mode: 'text',
      pythonOptions: ['-u'],
      scriptPath: path.join(__dirname, '../python_scripts'),
      args: [JSON.stringify(inputData)],
      timeout: 20000 // Increased timeout for complex models
    };

    PythonShell.run(scriptName, options, (err, results) => {
      if (err) {
        console.error(`❌ PythonShell Error in ${scriptName}:`, err.message);
        return reject({ error: `Prediction error in ${scriptName}`, details: 'Contact support if the issue persists.' });
      }

      if (!results || !results[0]) {
        console.error(`❌ No output from Python script ${scriptName}`);
        return reject({ error: 'No prediction output received.' });
      }

      try {
        const output = JSON.parse(results[0]);
        resolve(output);
      } catch (parseErr) {
        console.error(`❌ Parsing Error in ${scriptName}:`, parseErr.message);
        reject({ error: 'Error parsing Python response', details: 'Invalid format received from Python script.' });
      }
    });
  });
};

/**
 * Utility function to validate required fields in the input data.
 */
const validateInputData = (inputData, requiredFields) => {
  const missingFields = requiredFields.filter(field => !(field in inputData));
  if (missingFields.length) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
};

/**
 * Generalized prediction creator.
 */
const createPrediction = async (req, res, Model, scriptName, requiredFields = []) => {
  try {
    const inputData = req.body;

    if (requiredFields.length) {
      validateInputData(inputData, requiredFields);
    }

    const predictionOutput = await runPythonScript(scriptName, inputData);

    const newPrediction = new Model({
      userId: req.user.id,
      ...inputData,
      predictionResult: predictionOutput.predictionResult,
      probability: predictionOutput.probability
    });

    await newPrediction.save();

    res.status(200).json({
      message: `${Model.modelName} prediction saved successfully!`,
      prediction: newPrediction
    });
  } catch (error) {
    console.error(`❌ Error in ${scriptName.replace('.py', '')} prediction:`, error);
    res.status(500).json({
      error: 'Prediction error occurred',
      details: 'Contact support if the issue persists.'
    });
  }
};

// =======================
// GET Prediction History
// =======================

/**
 * Fetches prediction history for all diseases linked to an email.
 */
const getPredictionHistory = async (req, res) => {
  try {
    const { email } = req.query; // Only consider email for history fetching

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    console.log("🔍 Fetching history for email:", email);

    // Fetch history from all models in parallel
    const historyPromises = [
      DiabetesPrediction.find({ email }).sort({ createdAt: -1 }),
      HeartDiseasePrediction.find({ email }).sort({ createdAt: -1 }),
      LiverDiseasePrediction.find({ email }).sort({ createdAt: -1 }),
      KidneyDiseasePrediction.find({ email }).sort({ createdAt: -1 })
    ];

    const [diabetesHistory, heartHistory, liverHistory, kidneyHistory] = await Promise.all(historyPromises);

    const combinedHistory = [
      { diseaseType: 'diabetes', predictions: diabetesHistory },
      { diseaseType: 'heart', predictions: heartHistory },
      { diseaseType: 'liver', predictions: liverHistory },
      { diseaseType: 'kidney', predictions: kidneyHistory }
    ].filter(item => item.predictions.length > 0); // Only include disease types with history

    if (combinedHistory.length === 0) {
      return res.status(404).json({ message: 'No prediction history found for the given email' });
    }

    res.status(200).json(combinedHistory);
  } catch (error) {
    console.error('❌ Unexpected Error fetching prediction history:', error.message);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};
module.exports.createDiabetesPrediction = (req, res) => createPrediction(req, res, DiabetesPrediction, 'predict_diabetes.py', [
  'pregnancies',
  'glucose',
  'bloodPressure',
  'skinThickness',
  'insulin',
  'bmi',
  'diabetesPedigreeFunction',
  'age'
]);

module.exports = {
  getPredictionHistory,
  createPrediction,

};

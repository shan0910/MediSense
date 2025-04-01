const express = require('express');
const router = express.Router();
const { PythonShell } = require('python-shell');
const DiabetesPrediction = require('../models/diabetesPrediction');
const HeartDiseasePrediction = require('../models/heartPrediction');
const LiverDiseasePrediction = require('../models/liverPrediction');
const KidneyDiseasePrediction = require('../models/kidneyPrediction');
const path = require('path');

const diseaseModels = [
    { name: "diabetes", model: DiabetesPrediction },
    { name: "heart", model: HeartDiseasePrediction },
    { name: "liver", model: LiverDiseasePrediction },
    { name: "kidney", model: KidneyDiseasePrediction }
];

/**
 * Runs a Python script for disease prediction.
 */
const runPythonScript = async (scriptName, inputData) => {
    return new Promise((resolve, reject) => {
        const options = {
            mode: 'text',
            pythonOptions: ['-u'], 
            scriptPath: path.join(__dirname, '../python_scripts'),
            args: [JSON.stringify(inputData)],
            timeout: 10000 
        };

        PythonShell.run(scriptName, options, (err, result) => {
            if (err) {
                console.error(`❌ PythonShell Error in ${scriptName}:`, err);
                return reject({ error: 'Prediction error', details: err.message });
            }

            if (!result || result.length === 0) {
                return reject({ error: 'No result received from Python script' });
            }

            try {
                const predictionResult = JSON.parse(result[0]);
                resolve(predictionResult);
            } catch (error) {
                console.error(`❌ Parsing Error in ${scriptName}:`, error);
                reject({ error: 'Result parsing error' });
            }
        });
    });
};

/**
 * Validates the required fields in input data.
 */
const validateInputData = (inputData, requiredFields) => {
    const missingFields = requiredFields.filter(field => !inputData.hasOwnProperty(field));
    if (missingFields.length) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
};

/**
 * Fetches prediction history for a given email.
 */
const getPredictionHistory = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        console.log("🔍 Fetching history for email:", email);

        // Fetch history from all models in parallel
        const historyPromises = diseaseModels.map(({ name, model }) =>
            model.find({ email }).sort({ createdAt: -1 }).then(predictions =>
                predictions.length > 0 ? { diseaseType: name, predictions } : null
            ).catch(error => {
                console.error(`❌ Database query error for ${name}:`, error);
                return null;
            })
        );

        const combinedHistory = (await Promise.all(historyPromises)).filter(Boolean);

        if (combinedHistory.length === 0) {
            return res.status(404).json({ message: 'No prediction history found' });
        }

        res.status(200).json(combinedHistory);
    } catch (error) {
        console.error('❌ Unexpected Error fetching prediction history:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};

// Fetch prediction history for all diseases linked to an email
router.get('/history', getPredictionHistory);

module.exports = router;

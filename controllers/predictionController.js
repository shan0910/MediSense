const Prediction = require('../models/predictionModel'); // Ensure this matches your prediction schema

// Get Latest Prediction for User
exports.getLatestPrediction = async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    try {
        const latestPrediction = await Prediction.findOne({ email }).sort({ createdAt: -1 });
        if (!latestPrediction) return res.status(404).json({ error: 'No prediction found' });

        res.status(200).json(latestPrediction);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch latest prediction' });
    }
};

// Get Prediction History for User
exports.getPredictionHistory = async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    try {
        const history = await Prediction.find({ email }).sort({ createdAt: -1 });
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch prediction history' });
    }
};

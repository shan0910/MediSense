const express = require('express');
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');
const { spawn } = require('child_process');
const path = require('path');

// Route Imports
const authRoutes = require('../routes/registerAuth');
const appointmentRoutes = require('../routes/appointment');
const profileRoutes = require('../routes/profile');
const diseasePredictionRoutes = require('../routes/diseaseprediction');

const PORT = process.env.PORT || 8000;

const PredictDiabetes = path.resolve(__dirname, '../python_scripts/predict_diabetes.py');
const PredictHeart = path.resolve(__dirname, '../python_scripts/Predict_heart.py');
const PredictKidney = path.resolve(__dirname, '../python_scripts/predict_kidney.py');
const PredictLiver = path.resolve(__dirname, '../python_scripts/predict_liver.py');

// Middleware

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// MongoDB Connection with Retry Logic
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB connected successfully');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        setTimeout(connectDB, 5000);  // Retry every 5 seconds
    }
}
connectDB();

// EJS for Rendering
app.set('view engine', 'ejs');
app.use(express.static("public"));

// Routes for rendering EJS pages
app.get("/", (req, res) => res.render("home"));
app.get("/login", (req, res) => res.render("login", { redirectPath: req.query.redirect || '/' }));
app.get("/register", (req, res) => res.render("register"));
app.get("/profile", (req, res) => res.render("profile"));
app.use('/api/user', require('../routes/diseaseprediction'));

// Render the disease prediction page with prediction history
app.get('/profile/disease-prediction', async (req, res) => {
    const { email, phoneNumber } = req.query;
    let predictions = [];

    if (email || phoneNumber) {
        try {
            console.log("🔍 Fetching history for:", email || phoneNumber);

            const DiabetesPrediction = require('../models/diabetesPrediction');
            const HeartPrediction = require('../models/heartPrediction');
            const KidneyPrediction = require('../models/kidneyPrediction');
            const LiverPrediction = require('../models/liverPrediction');

            const query = email ? { email } : { phoneNumber };
            const diabetesHistory = await DiabetesPrediction.find(query).sort({ createdAt: -1 }) || [];
            const heartHistory = await HeartPrediction.find(query).sort({ createdAt: -1 }) || [];
            const kidneyHistory = await KidneyPrediction.find(query).sort({ createdAt: -1 }) || [];
            const liverHistory = await LiverPrediction.find(query).sort({ createdAt: -1 }) || [];

            predictions = [...diabetesHistory, ...heartHistory, ...kidneyHistory, ...liverHistory];

            // Sort by createdAt timestamp (newest first)
            predictions.sort((a, b) => b.createdAt - a.createdAt);

        } catch (error) {
            console.error(`❌ Error fetching prediction history: ${error.message}`);
        }
    }

    res.render('disease-prediction', { predictions });
});

// GET route for a single prediction result (optional)
app.get('/diabetes', async (req, res) => {
    const predictionId = req.query.predictionId;
    if (!predictionId) {
        return res.render('diabetes-prediction', { pred: null, probability: null, error: null });
    }
    try {
        const DiabetesPrediction = require('../models/diabetesPrediction');
        const prediction = await DiabetesPrediction.findById(predictionId);
        if (!prediction) {
            return res.render('diabetes-prediction', { pred: null, probability: null, error: '❌ Prediction not found.' });
        }
        res.render('diabetes-prediction', {
            pred: prediction.predictionResult,
            probability: prediction.probability || 'N/A',
            error: null
        });
    } catch (error) {
        console.error(`❌ Error loading prediction result: ${error.message}`);
        res.render('diabetes-prediction', { pred: null, probability: null, error: '❌ Error loading prediction result.' });
    }
});

// POST route for diabetes prediction submission
app.post('/diabetes', async (req, res) => {
    const { phoneNumber, email, ...predictionInput } = req.body;
    const inputData = JSON.stringify(predictionInput);
    console.log('Input Data Sent to Python Script:', inputData);

    const pythonProcess = spawn('python', [
        PredictDiabetes,
        inputData
    ]);

    pythonProcess.stdout.on('data', async (data) => {
        console.log('Raw Data from Python:', data.toString());
        try {
            const predictionData = JSON.parse(data.toString().trim());
            const predictionResult = predictionData.predictionResult || 'Prediction not available';
            const probability = predictionData.probability || 'N/A';

            const DiabetesPrediction = require('../models/diabetesPrediction');
            const newPrediction = new DiabetesPrediction({
                email,
                phoneNumber,
                ...predictionInput,
                predictionResult,
                probability: probability === 'N/A' ? null : probability
            });
            await newPrediction.save();

            res.render('diabetes-prediction', { pred: predictionResult, probability, error: null });
        } catch (error) {
            console.error('❌ Error processing prediction result:', error.message);
            res.render('diabetes-prediction', { pred: '❌ Error processing prediction result.', probability: null, error: null });
        }
    });

    pythonProcess.stderr.on('data', (error) => {
        console.error('❌ Python Script Error:', error.toString());
        res.render('diabetes-prediction', { pred: '❌ Prediction failed. Try again.', probability: null, error: null });
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python script exited with code ${code}`);
    });
});

app.get('/heart', async (req, res) => {
    const predictionId = req.query.predictionId;
    if (!predictionId) {
        return res.render('heart-prediction', { pred: null, probability: null, error: null });
    }
    try {
        const HeartPrediction = require('../models/heartPrediction');
        const prediction = await HeartPrediction.findById(predictionId);
        if (!prediction) {
            return res.render('heart-prediction', { pred: null, probability: null, error: '❌ Prediction not found.' });
        }
        res.render('heart-prediction', {
            pred: prediction.predictionResult,
            probability: prediction.probability || 'N/A',
            error: null
        });
    } catch (error) {
        console.error(`❌ Error loading prediction result: ${error.message}`);
        res.render('heart-prediction', { pred: null, probability: null, error: '❌ Error loading prediction result.' });
    }
});

// POST route for heart prediction submission
app.post('/heart', async (req, res) => {
    const { phoneNumber, email, ...predictionInput } = req.body;
    const inputData = JSON.stringify(predictionInput);
    console.log('Input Data Sent to Python Script:', inputData);

    const pythonProcess = spawn('python', [
        PredictHeart,
        inputData
    ]);

    pythonProcess.stdout.on('data', async (data) => {
        console.log('Raw Data from Python:', data.toString());
        try {
            const predictionData = JSON.parse(data.toString().trim());
            const predictionResult = predictionData.predictionResult || 'Prediction not available';
            const probability = predictionData.probability || 'N/A';

            const HeartPrediction = require('../models/heartPrediction');
            const newPrediction = new HeartPrediction({
                email,
                phoneNumber,
                ...predictionInput,
                predictionResult,
                probability: probability === 'N/A' ? null : probability
            });
            await newPrediction.save();

            res.render('heart-prediction', { pred: predictionResult, probability, error: null });
        } catch (error) {
            console.error('❌ Error processing prediction result:', error.message);
            res.render('heart-prediction', { pred: '❌ Error processing prediction result.', probability: null, error: null });
        }
    });

    pythonProcess.stderr.on('data', (error) => {
        console.error('❌ Python Script Error:', error.toString());
        res.render('heart-prediction', { pred: '❌ Prediction failed. Try again.', probability: null, error: null });
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python script exited with code ${code}`);
    });
});


app.get('/liver', async (req, res) => {
    const predictionId = req.query.predictionId;
    if (!predictionId) {
        return res.render('liver-prediction', { pred: null, probability: null, error: null });
    }
    try {
        const LiverPrediction = require('../models/liverPrediction');
        const prediction = await LiverPrediction.findById(predictionId);
        if (!prediction) {
            return res.render('liver-prediction', { pred: null, probability: null, error: '❌ Prediction not found.' });
        }
        res.render('liver-prediction', {
            pred: prediction.predictionResult,
            probability: prediction.probability || 'N/A',
            error: null
        });
    } catch (error) {
        console.error(`❌ Error loading prediction result: ${error.message}`);
        res.render('liver-prediction', { pred: null, probability: null, error: '❌ Error loading prediction result.' });
    }
});

// POST route for liver prediction submission
app.post('/liver', async (req, res) => {
    const { phoneNumber, email, ...predictionInput } = req.body;
    const inputData = JSON.stringify(predictionInput);
    console.log('Input Data Sent to Python Script:', inputData);

    const pythonProcess = spawn('python', [
        PredictLiver,
        inputData
    ]);

    pythonProcess.stdout.on('data', async (data) => {
        console.log('Raw Data from Python:', data.toString());
        try {
            const predictionData = JSON.parse(data.toString().trim());
            const predictionResult = predictionData.predictionResult || 'Prediction not available';
            const probability = predictionData.probability || 'N/A';

            const LiverPrediction = require('../models/liverPrediction');
            const newPrediction = new LiverPrediction({
                email,
                phoneNumber,
                ...predictionInput,
                predictionResult,
                probability: probability === 'N/A' ? null : probability
            });
            await newPrediction.save();

            res.render('liver-prediction', { pred: predictionResult, probability, error: null });
        } catch (error) {
            console.error('❌ Error processing prediction result:', error.message);
            res.render('liver-prediction', { pred: '❌ Error processing prediction result.', probability: null, error: null });
        }
    });

    pythonProcess.stderr.on('data', (error) => {
        console.error('❌ Python Script Error:', error.toString());
        res.render('liver-prediction', { pred: '❌ Prediction failed. Try again.', probability: null, error: null });
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python script exited with code ${code}`);
    });
});


app.get('/kidney', async (req, res) => {
    const predictionId = req.query.predictionId;
    if (!predictionId) {
        return res.render('kidney-prediction', { pred: null, probability: null, error: null });
    }
    try {
        const KidneyPrediction = require('../models/kidneyPrediction');
        const prediction = await KidneyPrediction.findById(predictionId);
        if (!prediction) {
            return res.render('kidney-prediction', { pred: null, probability: null, error: '❌ Prediction not found.' });
        }
        res.render('kidney-prediction', {
            pred: prediction.predictionResult,
            probability: prediction.probability || 'N/A',
            error: null
        });
    } catch (error) {
        console.error(`❌ Error loading prediction result: ${error.message}`);
        res.render('kidney-prediction', { pred: null, probability: null, error: '❌ Error loading prediction result.' });
    }
});

// POST route for kidney prediction submission
app.post('/kidney', async (req, res) => {
    const { phoneNumber, email, ...predictionInput } = req.body;
    const inputData = JSON.stringify(predictionInput);
    console.log('Input Data Sent to Python Script:', inputData);

    const pythonProcess = spawn('python', [
        PredictKidney,
        inputData
    ]);

    pythonProcess.stdout.on('data', async (data) => {
        console.log('Raw Data from Python:', data.toString());
        try {
            const predictionData = JSON.parse(data.toString().trim());
            const predictionResult = predictionData.predictionResult || 'Prediction not available';
            const probability = predictionData.probability || 'N/A';

            const KidneyPrediction = require('../models/kidneyPrediction');
            const newPrediction = new KidneyPrediction({
                email,
                phoneNumber,
                ...predictionInput,
                predictionResult,
                probability: probability === 'N/A' ? null : probability
            });
            await newPrediction.save();

            res.render('kidney-prediction', { pred: predictionResult, probability, error: null });
        } catch (error) {
            console.error('❌ Error processing prediction result:', error.message);
            res.render('kidney-prediction', { pred: '❌ Error processing prediction result.', probability: null, error: null });
        }
    });

    pythonProcess.stderr.on('data', (error) => {
        console.error('❌ Python Script Error:', error.toString());
        res.render('kidney-prediction', { pred: '❌ Prediction failed. Try again.', probability: null, error: null });
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python script exited with code ${code}`);
    });
});


app.post("/login", (req, res) => {
    const redirectTo = req.session.redirectTo || '/';
    delete req.session.redirectTo;
    res.redirect(redirectTo);
});



// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointment', appointmentRoutes);
app.use('/api/user', profileRoutes);
app.use('/api/user/disease-prediction', diseasePredictionRoutes);

// Default 404 Handler
app.use((req, res) => res.status(404).json({ error: '❌ Route not found' }));

// Start Server
app.listen(PORT , () => {
    console.log(`🚀 Server running on http://localhost:${PORT }`);
});

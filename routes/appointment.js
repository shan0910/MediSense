const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const Appointment = require('../models/Appointment');
const { getUserProfile } = require('../controllers/userController');

// Create appointment
router.post('/', async (req, res) => {
    console.log('Incoming request body:', req.body);

    const { patientName, age, mobileNumber, gender, country, specialist } = req.body;

    if (!patientName || !age || !mobileNumber || !gender || !country || !specialist) {
        console.log('Missing fields in request');
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const newAppointment = new Appointment({
            patientName,
            age,
            mobileNumber,
            gender,
            country,
            specialist
        }).save();

        // console.log('New Appointment Object:', newAppointment);

        // const appointment = await newAppointment.save();
        console.log('Appointment successfully saved:');
       

        // res.json(appointment);
    } catch (err) {
        console.error('Error saving appointment:', err.message);
        res.status(500).send('Server error');
    }
});

// Redirect to login if not authenticated
router.post('/check-auth', (req, res) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ redirectTo: '/login' });
    }
    res.status(200).json({ redirectTo: '/profile' });
});



module.exports = router;

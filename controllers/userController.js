const User = require('../models/User');

const getUserProfile = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Unauthorized access' });
        }

        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            name: user.name,
            age: user.age || 'N/A',  // If age wasn't provided, display 'N/A'
            email: user.email,
            phoneNumber: user.phone,
            nationality:user.nationality,
            gender:user.gender,
            date: user.createdAt || 'N/A'
        });
    } catch (error) {
        console.error('Error fetching profile data:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


// User Login Function
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { getUserProfile, loginUser };

const express = require('express');
const router = express.Router();
const { getUserProfile } = require('../controllers/userController'); // Correct import
const { authenticate } = require('../middleware/authMiddleware');
const User = require('../models/user');

router.get('/me', authenticate, getUserProfile);
// router.get('/me', authMiddleware, async (req, res) => {
//     try {
//         const user = await User.findById(req.user.id).select('-password');
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//         res.status(200).json(user);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });

module.exports = router;

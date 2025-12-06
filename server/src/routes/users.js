import express from 'express';
import { getDB } from '../config/database.js';
import { verifyFirebaseToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', verifyFirebaseToken, verifyAdmin, async (req, res) => {
    try {
        const db = getDB();
        const usersCollection = db.collection('users');

        const users = await usersCollection.find({}).toArray();

        res.json({
            success: true,
            users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users'
        });
    }
});

// Get current user profile
router.get('/me', verifyFirebaseToken, async (req, res) => {
    try {
        const db = getDB();
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne({ email: req.user.email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user profile'
        });
    }
});

// Update user role (admin only, cannot change own role)
router.patch('/:email/role', verifyFirebaseToken, verifyAdmin, async (req, res) => {
    try {
        const { email } = req.params;
        const { role } = req.body;

        // Prevent admin from changing their own role
        if (email === req.user.email) {
            return res.status(403).json({
                success: false,
                message: 'Cannot change your own role'
            });
        }

        if (!['admin', 'clubManager', 'member'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role'
            });
        }

        const db = getDB();
        const usersCollection = db.collection('users');

        const result = await usersCollection.updateOne(
            { email },
            { $set: { role } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User role updated successfully'
        });
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user role'
        });
    }
});

export default router;

import express from 'express';
import jwt from 'jsonwebtoken';
import { getDB } from '../config/database.js';

const router = express.Router();

// Register user (called after Firebase registration)
router.post('/register', async (req, res) => {
    try {
        const { name, email, photoURL } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: 'Name and email are required'
            });
        }

        const db = getDB();
        const usersCollection = db.collection('users');

        // Check if user already exists
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return res.status(200).json({
                success: true,
                message: 'User already exists',
                user: existingUser
            });
        }

        // Create new user with default role 'member'
        const newUser = {
            name,
            email,
            photoURL: photoURL || '',
            role: 'member',
            createdAt: new Date(),
        };

        await usersCollection.insertOne(newUser);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: newUser
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering user'
        });
    }
});

// Generate JWT token
router.post('/jwt', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const token = jwt.sign(
            { email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token
        });
    } catch (error) {
        console.error('JWT generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating token'
        });
    }
});

// Logout (client-side will clear token)
router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

export default router;

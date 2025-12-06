import admin from '../config/firebase.js';

// Middleware to verify Firebase token
export const verifyFirebaseToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = {
            email: decodedToken.email,
            uid: decodedToken.uid,
        };

        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

// Middleware to verify admin role
export const verifyAdmin = async (req, res, next) => {
    try {
        const { getDB } = await import('../config/database.js');
        const db = getDB();
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne({ email: req.user.email });

        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin role required.'
            });
        }

        req.userRole = user.role;
        next();
    } catch (error) {
        console.error('Admin verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error verifying admin role'
        });
    }
};

// Middleware to verify club manager role
export const verifyClubManager = async (req, res, next) => {
    try {
        const { getDB } = await import('../config/database.js');
        const db = getDB();
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne({ email: req.user.email });

        if (!user || user.role !== 'clubManager') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Club Manager role required.'
            });
        }

        req.userRole = user.role;
        next();
    } catch (error) {
        console.error('Club Manager verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error verifying club manager role'
        });
    }
};

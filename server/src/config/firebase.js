import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin SDK
const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin Initialized');
} catch (error) {
    console.warn('⚠️ Firebase Admin Initialization Failed (Check your FIREBASE_PRIVATE_KEY)');
    console.warn('   Auth features will not work, but the server will run.');
}

export default admin;

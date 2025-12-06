import { createContext, useContext, useEffect, useState } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Register with email and password
    const register = async (name, email, password, photoURL) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Create user in database
            await api.post('/api/auth/register', {
                name,
                email,
                photoURL: photoURL || '',
            });

            // Get Firebase token
            const token = await userCredential.user.getIdToken();
            localStorage.setItem('firebaseToken', token);

            toast.success('Registration successful!');
            return userCredential.user;
        } catch (error) {
            console.error('Registration error:', error);
            toast.error(error.message || 'Registration failed');
            throw error;
        }
    };

    // Login with email and password
    const login = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            // Get Firebase token
            const token = await userCredential.user.getIdToken();
            localStorage.setItem('firebaseToken', token);

            toast.success('Login successful!');
            return userCredential.user;
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error.message || 'Login failed');
            throw error;
        }
    };

    // Login with Google
    const loginWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);

            // Create user in database if doesn't exist
            await api.post('/api/auth/register', {
                name: userCredential.user.displayName,
                email: userCredential.user.email,
                photoURL: userCredential.user.photoURL || '',
            });

            // Get Firebase token
            const token = await userCredential.user.getIdToken();
            localStorage.setItem('firebaseToken', token);

            toast.success('Login successful!');
            return userCredential.user;
        } catch (error) {
            console.error('Google login error:', error);
            toast.error(error.message || 'Google login failed');
            throw error;
        }
    };

    // Logout
    const logout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('firebaseToken');
            setUser(null);
            setUserProfile(null);
            toast.success('Logged out successfully');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Logout failed');
            throw error;
        }
    };

    // Fetch user profile from database
    const fetchUserProfile = async (email) => {
        try {
            const response = await api.get('/api/users/me');
            if (response.data.success) {
                setUserProfile(response.data.user);
            }
        } catch (error) {
            console.error('Fetch user profile error:', error);
        }
    };

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);

                // Get and store Firebase token
                const token = await currentUser.getIdToken();
                localStorage.setItem('firebaseToken', token);

                // Fetch user profile from database
                await fetchUserProfile(currentUser.email);
            } else {
                setUser(null);
                setUserProfile(null);
                localStorage.removeItem('firebaseToken');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const value = {
        user,
        userProfile,
        loading,
        register,
        login,
        loginWithGoogle,
        logout,
        fetchUserProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

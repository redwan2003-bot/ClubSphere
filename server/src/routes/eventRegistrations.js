import express from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/database.js';
import { verifyFirebaseToken } from '../middleware/auth.js';

const router = express.Router();

// Get current user's event registrations
router.get('/my-registrations', verifyFirebaseToken, async (req, res) => {
    try {
        const db = getDB();
        const registrationsCollection = db.collection('eventRegistrations');
        const eventsCollection = db.collection('events');
        const clubsCollection = db.collection('clubs');

        const registrations = await registrationsCollection.find({ userEmail: req.user.email }).toArray();

        // Populate event and club details
        const registrationsWithDetails = await Promise.all(
            registrations.map(async (registration) => {
                const event = await eventsCollection.findOne({ _id: new ObjectId(registration.eventId) });
                const club = event ? await clubsCollection.findOne({ _id: event.clubId }) : null;
                return { ...registration, event, club };
            })
        );

        res.json({
            success: true,
            registrations: registrationsWithDetails
        });
    } catch (error) {
        console.error('Get registrations error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching registrations'
        });
    }
});

// Get registrations for an event (club manager only)
router.get('/event/:eventId', verifyFirebaseToken, async (req, res) => {
    try {
        const { eventId } = req.params;
        const db = getDB();
        const registrationsCollection = db.collection('eventRegistrations');
        const eventsCollection = db.collection('events');
        const clubsCollection = db.collection('clubs');
        const usersCollection = db.collection('users');

        // Check if event exists
        const event = await eventsCollection.findOne({ _id: new ObjectId(eventId) });
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if user is manager of the club
        const club = await clubsCollection.findOne({ _id: event.clubId });
        if (club.managerEmail !== req.user.email) {
            return res.status(403).json({
                success: false,
                message: 'You can only view registrations for your own events'
            });
        }

        const registrations = await registrationsCollection.find({ eventId: new ObjectId(eventId) }).toArray();

        // Populate user details
        const registrationsWithUsers = await Promise.all(
            registrations.map(async (registration) => {
                const user = await usersCollection.findOne({ email: registration.userEmail });
                return { ...registration, user };
            })
        );

        res.json({
            success: true,
            registrations: registrationsWithUsers
        });
    } catch (error) {
        console.error('Get event registrations error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching event registrations'
        });
    }
});

// Register for an event
router.post('/register', verifyFirebaseToken, async (req, res) => {
    try {
        const { eventId, paymentId } = req.body;

        if (!eventId) {
            return res.status(400).json({
                success: false,
                message: 'Event ID is required'
            });
        }

        const db = getDB();
        const registrationsCollection = db.collection('eventRegistrations');
        const eventsCollection = db.collection('events');

        // Check if event exists
        const event = await eventsCollection.findOne({ _id: new ObjectId(eventId) });
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if user already registered
        const existingRegistration = await registrationsCollection.findOne({
            userEmail: req.user.email,
            eventId: new ObjectId(eventId),
        });

        if (existingRegistration) {
            return res.status(400).json({
                success: false,
                message: 'You are already registered for this event'
            });
        }

        // Check max attendees
        if (event.maxAttendees) {
            const registrationCount = await registrationsCollection.countDocuments({
                eventId: new ObjectId(eventId),
                status: 'registered'
            });

            if (registrationCount >= event.maxAttendees) {
                return res.status(400).json({
                    success: false,
                    message: 'Event is full'
                });
            }
        }

        const newRegistration = {
            eventId: new ObjectId(eventId),
            userEmail: req.user.email,
            clubId: event.clubId,
            status: 'registered',
            paymentId: paymentId || null,
            registeredAt: new Date(),
        };

        const result = await registrationsCollection.insertOne(newRegistration);

        res.status(201).json({
            success: true,
            message: 'Successfully registered for the event',
            registrationId: result.insertedId
        });
    } catch (error) {
        console.error('Register for event error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering for event'
        });
    }
});

// Cancel event registration
router.patch('/:id/cancel', verifyFirebaseToken, async (req, res) => {
    try {
        const { id } = req.params;
        const db = getDB();
        const registrationsCollection = db.collection('eventRegistrations');

        const registration = await registrationsCollection.findOne({ _id: new ObjectId(id) });
        if (!registration) {
            return res.status(404).json({
                success: false,
                message: 'Registration not found'
            });
        }

        if (registration.userEmail !== req.user.email) {
            return res.status(403).json({
                success: false,
                message: 'You can only cancel your own registrations'
            });
        }

        await registrationsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { status: 'cancelled' } }
        );

        res.json({
            success: true,
            message: 'Registration cancelled successfully'
        });
    } catch (error) {
        console.error('Cancel registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling registration'
        });
    }
});

export default router;

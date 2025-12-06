import express from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/database.js';
import { verifyFirebaseToken, verifyAdmin } from '../middleware/auth.js';
import stripe from '../config/stripe.js';

const router = express.Router();

// Create payment intent for membership
router.post('/create-membership-intent', verifyFirebaseToken, async (req, res) => {
    try {
        const { clubId } = req.body;

        const db = getDB();
        const clubsCollection = db.collection('clubs');

        const club = await clubsCollection.findOne({ _id: new ObjectId(clubId) });
        if (!club) {
            return res.status(404).json({
                success: false,
                message: 'Club not found'
            });
        }

        if (club.membershipFee === 0) {
            return res.status(400).json({
                success: false,
                message: 'This club has free membership'
            });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(club.membershipFee * 100), // Convert to cents
            currency: 'usd',
            metadata: {
                type: 'membership',
                clubId: clubId,
                userEmail: req.user.email,
            },
        });

        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error) {
        console.error('Create membership payment intent error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating payment intent'
        });
    }
});

// Create payment intent for event
router.post('/create-event-intent', verifyFirebaseToken, async (req, res) => {
    try {
        const { eventId } = req.body;

        const db = getDB();
        const eventsCollection = db.collection('events');

        const event = await eventsCollection.findOne({ _id: new ObjectId(eventId) });
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        if (!event.isPaid || event.eventFee === 0) {
            return res.status(400).json({
                success: false,
                message: 'This event is free'
            });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(event.eventFee * 100), // Convert to cents
            currency: 'usd',
            metadata: {
                type: 'event',
                eventId: eventId,
                clubId: event.clubId.toString(),
                userEmail: req.user.email,
            },
        });

        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error) {
        console.error('Create event payment intent error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating payment intent'
        });
    }
});

// Confirm payment and create record
router.post('/confirm-payment', verifyFirebaseToken, async (req, res) => {
    try {
        const { paymentIntentId, type, clubId, eventId } = req.body;

        // Verify payment with Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({
                success: false,
                message: 'Payment not successful'
            });
        }

        const db = getDB();
        const paymentsCollection = db.collection('payments');

        // Create payment record
        const paymentRecord = {
            userEmail: req.user.email,
            amount: paymentIntent.amount / 100, // Convert from cents
            type,
            clubId: clubId ? new ObjectId(clubId) : null,
            eventId: eventId ? new ObjectId(eventId) : null,
            stripePaymentIntentId: paymentIntentId,
            status: 'completed',
            createdAt: new Date(),
        };

        await paymentsCollection.insertOne(paymentRecord);

        res.json({
            success: true,
            message: 'Payment confirmed successfully',
            paymentId: paymentIntentId
        });
    } catch (error) {
        console.error('Confirm payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error confirming payment'
        });
    }
});

// Get current user's payment history
router.get('/my-payments', verifyFirebaseToken, async (req, res) => {
    try {
        const db = getDB();
        const paymentsCollection = db.collection('payments');
        const clubsCollection = db.collection('clubs');
        const eventsCollection = db.collection('events');

        const payments = await paymentsCollection.find({ userEmail: req.user.email }).sort({ createdAt: -1 }).toArray();

        // Populate club and event details
        const paymentsWithDetails = await Promise.all(
            payments.map(async (payment) => {
                let club = null;
                let event = null;

                if (payment.clubId) {
                    club = await clubsCollection.findOne({ _id: payment.clubId });
                }
                if (payment.eventId) {
                    event = await eventsCollection.findOne({ _id: payment.eventId });
                }

                return { ...payment, club, event };
            })
        );

        res.json({
            success: true,
            payments: paymentsWithDetails
        });
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payments'
        });
    }
});

// Get payments for a club (club manager only)
router.get('/club/:clubId', verifyFirebaseToken, async (req, res) => {
    try {
        const { clubId } = req.params;
        const db = getDB();
        const paymentsCollection = db.collection('payments');
        const clubsCollection = db.collection('clubs');

        // Check if user is manager of this club
        const club = await clubsCollection.findOne({ _id: new ObjectId(clubId) });
        if (!club) {
            return res.status(404).json({
                success: false,
                message: 'Club not found'
            });
        }

        if (club.managerEmail !== req.user.email) {
            return res.status(403).json({
                success: false,
                message: 'You can only view payments for your own clubs'
            });
        }

        const payments = await paymentsCollection.find({ clubId: new ObjectId(clubId) }).sort({ createdAt: -1 }).toArray();

        res.json({
            success: true,
            payments
        });
    } catch (error) {
        console.error('Get club payments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching club payments'
        });
    }
});

// Get all payments (admin only)
router.get('/all', verifyFirebaseToken, verifyAdmin, async (req, res) => {
    try {
        const db = getDB();
        const paymentsCollection = db.collection('payments');
        const clubsCollection = db.collection('clubs');
        const eventsCollection = db.collection('events');

        const payments = await paymentsCollection.find({}).sort({ createdAt: -1 }).toArray();

        // Populate club and event details
        const paymentsWithDetails = await Promise.all(
            payments.map(async (payment) => {
                let club = null;
                let event = null;

                if (payment.clubId) {
                    club = await clubsCollection.findOne({ _id: payment.clubId });
                }
                if (payment.eventId) {
                    event = await eventsCollection.findOne({ _id: payment.eventId });
                }

                return { ...payment, club, event };
            })
        );

        res.json({
            success: true,
            payments: paymentsWithDetails
        });
    } catch (error) {
        console.error('Get all payments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching all payments'
        });
    }
});

export default router;

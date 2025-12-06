import express from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/database.js';
import { verifyFirebaseToken } from '../middleware/auth.js';

const router = express.Router();

// Get all upcoming events (public, with search, filter, sort)
router.get('/', async (req, res) => {
    try {
        const { search, clubId, sort } = req.query;
        const db = getDB();
        const eventsCollection = db.collection('events');

        let query = { eventDate: { $gte: new Date() } };

        // Search by event title
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        // Filter by club
        if (clubId) {
            query.clubId = new ObjectId(clubId);
        }

        // Sorting
        let sortOption = { eventDate: 1 }; // Default: earliest first
        if (sort === 'latest') sortOption = { eventDate: -1 };
        else if (sort === 'newest') sortOption = { createdAt: -1 };

        const events = await eventsCollection.find(query).sort(sortOption).toArray();

        res.json({
            success: true,
            events
        });
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching events'
        });
    }
});

// Get events for a specific club
router.get('/club/:clubId', async (req, res) => {
    try {
        const { clubId } = req.params;
        const db = getDB();
        const eventsCollection = db.collection('events');

        const events = await eventsCollection.find({ clubId: new ObjectId(clubId) }).sort({ eventDate: 1 }).toArray();

        res.json({
            success: true,
            events
        });
    } catch (error) {
        console.error('Get club events error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching club events'
        });
    }
});

// Get events created by current club manager
router.get('/my-events', verifyFirebaseToken, async (req, res) => {
    try {
        const db = getDB();
        const eventsCollection = db.collection('events');
        const clubsCollection = db.collection('clubs');

        // Get clubs managed by current user
        const clubs = await clubsCollection.find({ managerEmail: req.user.email }).toArray();
        const clubIds = clubs.map(club => club._id);

        const events = await eventsCollection.find({ clubId: { $in: clubIds } }).sort({ eventDate: 1 }).toArray();

        res.json({
            success: true,
            events
        });
    } catch (error) {
        console.error('Get my events error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching your events'
        });
    }
});

// Get event details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const db = getDB();
        const eventsCollection = db.collection('events');

        const event = await eventsCollection.findOne({ _id: new ObjectId(id) });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.json({
            success: true,
            event
        });
    } catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching event'
        });
    }
});

// Create event (club manager only, for their clubs)
router.post('/', verifyFirebaseToken, async (req, res) => {
    try {
        const { clubId, title, description, eventDate, location, isPaid, eventFee, maxAttendees } = req.body;

        if (!clubId || !title || !description || !eventDate || !location) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided'
            });
        }

        const db = getDB();
        const eventsCollection = db.collection('events');
        const clubsCollection = db.collection('clubs');

        // Check if club belongs to current user
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
                message: 'You can only create events for your own clubs'
            });
        }

        const newEvent = {
            clubId: new ObjectId(clubId),
            title,
            description,
            eventDate: new Date(eventDate),
            location,
            isPaid: isPaid || false,
            eventFee: isPaid ? Number(eventFee) : 0,
            maxAttendees: maxAttendees ? Number(maxAttendees) : null,
            createdAt: new Date(),
        };

        const result = await eventsCollection.insertOne(newEvent);

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            eventId: result.insertedId
        });
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating event'
        });
    }
});

// Update event (club manager only, own events)
router.patch('/:id', verifyFirebaseToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, eventDate, location, isPaid, eventFee, maxAttendees } = req.body;

        const db = getDB();
        const eventsCollection = db.collection('events');
        const clubsCollection = db.collection('clubs');

        // Check if event exists
        const event = await eventsCollection.findOne({ _id: new ObjectId(id) });
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if club belongs to current user
        const club = await clubsCollection.findOne({ _id: event.clubId });
        if (club.managerEmail !== req.user.email) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own events'
            });
        }

        const updateData = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (eventDate) updateData.eventDate = new Date(eventDate);
        if (location) updateData.location = location;
        if (isPaid !== undefined) updateData.isPaid = isPaid;
        if (eventFee !== undefined) updateData.eventFee = Number(eventFee);
        if (maxAttendees !== undefined) updateData.maxAttendees = maxAttendees ? Number(maxAttendees) : null;

        await eventsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        res.json({
            success: true,
            message: 'Event updated successfully'
        });
    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating event'
        });
    }
});

// Delete event (club manager only, own events)
router.delete('/:id', verifyFirebaseToken, async (req, res) => {
    try {
        const { id } = req.params;
        const db = getDB();
        const eventsCollection = db.collection('events');
        const clubsCollection = db.collection('clubs');

        const event = await eventsCollection.findOne({ _id: new ObjectId(id) });
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        const club = await clubsCollection.findOne({ _id: event.clubId });
        if (club.managerEmail !== req.user.email) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own events'
            });
        }

        await eventsCollection.deleteOne({ _id: new ObjectId(id) });

        res.json({
            success: true,
            message: 'Event deleted successfully'
        });
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting event'
        });
    }
});

export default router;

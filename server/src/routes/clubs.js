import express from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/database.js';
import { verifyFirebaseToken, verifyAdmin, verifyClubManager } from '../middleware/auth.js';

const router = express.Router();

// Get all approved clubs (public, with search, filter, sort)
router.get('/', async (req, res) => {
    try {
        const { search, category, sort } = req.query;
        const db = getDB();
        const clubsCollection = db.collection('clubs');

        let query = { status: 'approved' };

        // Search by club name
        if (search) {
            query.clubName = { $regex: search, $options: 'i' };
        }

        // Filter by category
        if (category) {
            query.category = category;
        }

        // Sorting
        let sortOption = { createdAt: -1 }; // Default: newest first
        if (sort === 'oldest') sortOption = { createdAt: 1 };
        else if (sort === 'highestFee') sortOption = { membershipFee: -1 };
        else if (sort === 'lowestFee') sortOption = { membershipFee: 1 };

        const clubs = await clubsCollection.find(query).sort(sortOption).toArray();

        res.json({
            success: true,
            clubs
        });
    } catch (error) {
        console.error('Get clubs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching clubs'
        });
    }
});

// Get pending clubs (admin only)
router.get('/pending', verifyFirebaseToken, verifyAdmin, async (req, res) => {
    try {
        const db = getDB();
        const clubsCollection = db.collection('clubs');

        const clubs = await clubsCollection.find({ status: 'pending' }).toArray();

        res.json({
            success: true,
            clubs
        });
    } catch (error) {
        console.error('Get pending clubs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pending clubs'
        });
    }
});

// Get clubs managed by current user (club manager only)
router.get('/my-clubs', verifyFirebaseToken, async (req, res) => {
    try {
        const db = getDB();
        const clubsCollection = db.collection('clubs');

        const clubs = await clubsCollection.find({ managerEmail: req.user.email }).toArray();

        res.json({
            success: true,
            clubs
        });
    } catch (error) {
        console.error('Get my clubs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching your clubs'
        });
    }
});

// Get club details by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const db = getDB();
        const clubsCollection = db.collection('clubs');

        const club = await clubsCollection.findOne({ _id: new ObjectId(id) });

        if (!club) {
            return res.status(404).json({
                success: false,
                message: 'Club not found'
            });
        }

        res.json({
            success: true,
            club
        });
    } catch (error) {
        console.error('Get club error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching club'
        });
    }
});

// Create new club (club manager only, status: pending)
router.post('/', verifyFirebaseToken, async (req, res) => {
    try {
        const { clubName, description, category, location, bannerImage, membershipFee } = req.body;

        if (!clubName || !description || !category || !location) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided'
            });
        }

        const db = getDB();
        const clubsCollection = db.collection('clubs');

        const newClub = {
            clubName,
            description,
            category,
            location,
            bannerImage: bannerImage || '',
            membershipFee: Number(membershipFee) || 0,
            status: 'pending',
            managerEmail: req.user.email,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await clubsCollection.insertOne(newClub);

        res.status(201).json({
            success: true,
            message: 'Club created successfully. Awaiting admin approval.',
            clubId: result.insertedId
        });
    } catch (error) {
        console.error('Create club error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating club'
        });
    }
});

// Update club details (club manager only, own clubs)
router.patch('/:id', verifyFirebaseToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { clubName, description, category, location, bannerImage, membershipFee } = req.body;

        const db = getDB();
        const clubsCollection = db.collection('clubs');

        // Check if club belongs to current user
        const club = await clubsCollection.findOne({ _id: new ObjectId(id) });
        if (!club) {
            return res.status(404).json({
                success: false,
                message: 'Club not found'
            });
        }

        if (club.managerEmail !== req.user.email) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own clubs'
            });
        }

        const updateData = {
            updatedAt: new Date(),
        };

        if (clubName) updateData.clubName = clubName;
        if (description) updateData.description = description;
        if (category) updateData.category = category;
        if (location) updateData.location = location;
        if (bannerImage !== undefined) updateData.bannerImage = bannerImage;
        if (membershipFee !== undefined) updateData.membershipFee = Number(membershipFee);

        await clubsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        res.json({
            success: true,
            message: 'Club updated successfully'
        });
    } catch (error) {
        console.error('Update club error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating club'
        });
    }
});

// Approve/reject club (admin only)
router.patch('/:id/status', verifyFirebaseToken, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const db = getDB();
        const clubsCollection = db.collection('clubs');

        const result = await clubsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { status, updatedAt: new Date() } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Club not found'
            });
        }

        res.json({
            success: true,
            message: `Club ${status} successfully`
        });
    } catch (error) {
        console.error('Update club status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating club status'
        });
    }
});

// Delete club (admin or club manager)
router.delete('/:id', verifyFirebaseToken, async (req, res) => {
    try {
        const { id } = req.params;
        const db = getDB();
        const clubsCollection = db.collection('clubs');
        const usersCollection = db.collection('users');

        const club = await clubsCollection.findOne({ _id: new ObjectId(id) });
        if (!club) {
            return res.status(404).json({
                success: false,
                message: 'Club not found'
            });
        }

        // Check if user is admin or club manager of this club
        const user = await usersCollection.findOne({ email: req.user.email });
        if (user.role !== 'admin' && club.managerEmail !== req.user.email) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own clubs'
            });
        }

        await clubsCollection.deleteOne({ _id: new ObjectId(id) });

        res.json({
            success: true,
            message: 'Club deleted successfully'
        });
    } catch (error) {
        console.error('Delete club error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting club'
        });
    }
});

export default router;

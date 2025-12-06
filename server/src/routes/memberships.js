import express from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/database.js';
import { verifyFirebaseToken } from '../middleware/auth.js';

const router = express.Router();

// Get current user's memberships
router.get('/my-memberships', verifyFirebaseToken, async (req, res) => {
    try {
        const db = getDB();
        const membershipsCollection = db.collection('memberships');
        const clubsCollection = db.collection('clubs');

        const memberships = await membershipsCollection.find({ userEmail: req.user.email }).toArray();

        // Populate club details
        const membershipsWithClubs = await Promise.all(
            memberships.map(async (membership) => {
                const club = await clubsCollection.findOne({ _id: new ObjectId(membership.clubId) });
                return { ...membership, club };
            })
        );

        res.json({
            success: true,
            memberships: membershipsWithClubs
        });
    } catch (error) {
        console.error('Get memberships error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching memberships'
        });
    }
});

// Get members of a club (club manager only)
router.get('/club/:clubId', verifyFirebaseToken, async (req, res) => {
    try {
        const { clubId } = req.params;
        const db = getDB();
        const membershipsCollection = db.collection('memberships');
        const clubsCollection = db.collection('clubs');
        const usersCollection = db.collection('users');

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
                message: 'You can only view members of your own clubs'
            });
        }

        const memberships = await membershipsCollection.find({ clubId: new ObjectId(clubId) }).toArray();

        // Populate user details
        const membershipsWithUsers = await Promise.all(
            memberships.map(async (membership) => {
                const user = await usersCollection.findOne({ email: membership.userEmail });
                return { ...membership, user };
            })
        );

        res.json({
            success: true,
            memberships: membershipsWithUsers
        });
    } catch (error) {
        console.error('Get club members error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching club members'
        });
    }
});

// Join a club (create membership)
router.post('/join', verifyFirebaseToken, async (req, res) => {
    try {
        const { clubId, paymentId } = req.body;

        if (!clubId) {
            return res.status(400).json({
                success: false,
                message: 'Club ID is required'
            });
        }

        const db = getDB();
        const membershipsCollection = db.collection('memberships');
        const clubsCollection = db.collection('clubs');

        // Check if club exists and is approved
        const club = await clubsCollection.findOne({ _id: new ObjectId(clubId) });
        if (!club || club.status !== 'approved') {
            return res.status(404).json({
                success: false,
                message: 'Club not found or not approved'
            });
        }

        // Check if user already has membership
        const existingMembership = await membershipsCollection.findOne({
            userEmail: req.user.email,
            clubId: new ObjectId(clubId),
        });

        if (existingMembership) {
            return res.status(400).json({
                success: false,
                message: 'You are already a member of this club'
            });
        }

        const newMembership = {
            userEmail: req.user.email,
            clubId: new ObjectId(clubId),
            status: 'active',
            paymentId: paymentId || null,
            joinedAt: new Date(),
            expiresAt: null,
        };

        const result = await membershipsCollection.insertOne(newMembership);

        res.status(201).json({
            success: true,
            message: 'Successfully joined the club',
            membershipId: result.insertedId
        });
    } catch (error) {
        console.error('Join club error:', error);
        res.status(500).json({
            success: false,
            message: 'Error joining club'
        });
    }
});

// Update membership status (admin or club manager)
router.patch('/:id/status', verifyFirebaseToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'expired'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const db = getDB();
        const membershipsCollection = db.collection('memberships');

        const result = await membershipsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { status } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Membership not found'
            });
        }

        res.json({
            success: true,
            message: 'Membership status updated successfully'
        });
    } catch (error) {
        console.error('Update membership status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating membership status'
        });
    }
});

export default router;

import express from 'express';
import { getDB } from '../config/database.js';
import { verifyFirebaseToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get platform overview statistics (admin only)
router.get('/overview', verifyFirebaseToken, verifyAdmin, async (req, res) => {
    try {
        const db = getDB();
        const usersCollection = db.collection('users');
        const clubsCollection = db.collection('clubs');
        const membershipsCollection = db.collection('memberships');
        const eventsCollection = db.collection('events');
        const paymentsCollection = db.collection('payments');

        const [
            totalUsers,
            totalClubs,
            pendingClubs,
            approvedClubs,
            rejectedClubs,
            totalMemberships,
            totalEvents,
            totalPayments,
            totalRevenue
        ] = await Promise.all([
            usersCollection.countDocuments(),
            clubsCollection.countDocuments(),
            clubsCollection.countDocuments({ status: 'pending' }),
            clubsCollection.countDocuments({ status: 'approved' }),
            clubsCollection.countDocuments({ status: 'rejected' }),
            membershipsCollection.countDocuments(),
            eventsCollection.countDocuments(),
            paymentsCollection.countDocuments(),
            paymentsCollection.aggregate([
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]).toArray()
        ]);

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalClubs,
                pendingClubs,
                approvedClubs,
                rejectedClubs,
                totalMemberships,
                totalEvents,
                totalPayments,
                totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0
            }
        });
    } catch (error) {
        console.error('Get overview stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching overview statistics'
        });
    }
});

// Get memberships per club (admin only, for chart)
router.get('/memberships-per-club', verifyFirebaseToken, verifyAdmin, async (req, res) => {
    try {
        const db = getDB();
        const membershipsCollection = db.collection('memberships');
        const clubsCollection = db.collection('clubs');

        const membershipCounts = await membershipsCollection.aggregate([
            {
                $group: {
                    _id: '$clubId',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]).toArray();

        // Populate club names
        const data = await Promise.all(
            membershipCounts.map(async (item) => {
                const club = await clubsCollection.findOne({ _id: item._id });
                return {
                    clubName: club ? club.clubName : 'Unknown',
                    memberCount: item.count
                };
            })
        );

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Get memberships per club error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching memberships per club'
        });
    }
});

export default router;

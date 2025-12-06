import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const ClubDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [joining, setJoining] = useState(false);

    const { data: clubData, isLoading } = useQuery({
        queryKey: ['club', id],
        queryFn: async () => {
            const response = await api.get(`/api/clubs/${id}`);
            return response.data;
        },
    });

    const { data: eventsData } = useQuery({
        queryKey: ['clubEvents', id],
        queryFn: async () => {
            const response = await api.get(`/api/events/club/${id}`);
            return response.data;
        },
    });

    const club = clubData?.club;
    const events = eventsData?.events || [];

    const handleJoinClub = async () => {
        if (!user) {
            toast.error('Please login to join this club');
            return;
        }

        setJoining(true);
        try {
            if (club.membershipFee === 0) {
                // Free club - join directly
                await api.post('/api/memberships/join', { clubId: id });
                toast.success('Successfully joined the club!');
                queryClient.invalidateQueries(['memberships']);
            } else {
                // Paid club - create payment intent
                const { data } = await api.post('/api/payments/create-membership-intent', { clubId: id });

                const stripe = await stripePromise;
                const { error } = await stripe.confirmCardPayment(data.clientSecret, {
                    payment_method: {
                        card: {
                            // This is a simplified version - in production, use Stripe Elements
                            number: '4242424242424242',
                            exp_month: 12,
                            exp_year: 2025,
                            cvc: '123',
                        },
                    },
                });

                if (error) {
                    toast.error(error.message);
                } else {
                    // Confirm payment and create membership
                    await api.post('/api/payments/confirm-payment', {
                        paymentIntentId: data.paymentIntentId,
                        type: 'membership',
                        clubId: id,
                    });

                    await api.post('/api/memberships/join', {
                        clubId: id,
                        paymentId: data.paymentIntentId
                    });

                    toast.success('Payment successful! You are now a member.');
                    queryClient.invalidateQueries(['memberships']);
                }
            }
        } catch (error) {
            console.error('Join club error:', error);
            toast.error(error.response?.data?.message || 'Failed to join club');
        } finally {
            setJoining(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (!club) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Club not found</h2>
                    <Link to="/clubs" className="btn btn-primary">Back to Clubs</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-100 py-12 px-4">
            <div className="container mx-auto max-w-4xl">
                {/* Club Header */}
                <div className="card bg-base-200 shadow-xl mb-8">
                    <figure className="h-64 overflow-hidden">
                        <img
                            src={club.bannerImage || 'https://via.placeholder.com/800x400?text=Club'}
                            alt={club.clubName}
                            className="w-full h-full object-cover"
                        />
                    </figure>
                    <div className="card-body">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-4xl font-bold mb-2">{club.clubName}</h1>
                                <div className="flex items-center gap-4 text-sm text-base-content/70">
                                    <span className="badge badge-primary badge-lg">{club.category}</span>
                                    <span>{club.location}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-base-content/60">Membership Fee</p>
                                <p className="text-3xl font-bold text-primary">
                                    {club.membershipFee === 0 ? 'Free' : `$${club.membershipFee}`}
                                </p>
                            </div>
                        </div>

                        <div className="divider"></div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-3">About</h2>
                            <p className="text-base-content/80">{club.description}</p>
                        </div>

                        <div className="card-actions justify-end mt-6">
                            <button
                                onClick={handleJoinClub}
                                className="btn btn-primary btn-lg"
                                disabled={joining}
                            >
                                {joining ? <span className="loading loading-spinner"></span> : 'Join Club'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Upcoming Events */}
                <div className="card bg-base-200 shadow-xl">
                    <div className="card-body">
                        <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>

                        {events.length === 0 ? (
                            <p className="text-base-content/60">No upcoming events</p>
                        ) : (
                            <div className="space-y-4">
                                {events.map((event) => (
                                    <div key={event._id} className="flex justify-between items-center p-4 bg-base-100 rounded-lg">
                                        <div>
                                            <h3 className="font-semibold text-lg">{event.title}</h3>
                                            <p className="text-sm text-base-content/70">
                                                {new Date(event.eventDate).toLocaleDateString()} • {event.location}
                                            </p>
                                        </div>
                                        <Link to={`/events/${event._id}`} className="btn btn-primary btn-sm">
                                            View Details
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClubDetails;

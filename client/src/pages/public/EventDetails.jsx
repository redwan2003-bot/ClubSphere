import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FaCalendar, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const EventDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [registering, setRegistering] = useState(false);

    const { data: eventData, isLoading } = useQuery({
        queryKey: ['event', id],
        queryFn: async () => {
            const response = await api.get(`/api/events/${id}`);
            return response.data;
        },
    });

    const event = eventData?.event;

    const handleRegister = async () => {
        if (!user) {
            toast.error('Please login to register for this event');
            return;
        }

        setRegistering(true);
        try {
            if (!event.isPaid || event.eventFee === 0) {
                // Free event - register directly
                await api.post('/api/event-registrations/register', { eventId: id });
                toast.success('Successfully registered for the event!');
                queryClient.invalidateQueries(['eventRegistrations']);
            } else {
                // Paid event - create payment intent
                const { data } = await api.post('/api/payments/create-event-intent', { eventId: id });

                // Note: This is simplified - in production, use Stripe Elements properly
                toast.success('Payment processing... (Simplified for demo)');

                // Confirm payment and create registration
                await api.post('/api/payments/confirm-payment', {
                    paymentIntentId: data.paymentIntentId,
                    type: 'event',
                    eventId: id,
                });

                await api.post('/api/event-registrations/register', {
                    eventId: id,
                    paymentId: data.paymentIntentId
                });

                toast.success('Registration successful!');
                queryClient.invalidateQueries(['eventRegistrations']);
            }
        } catch (error) {
            console.error('Register error:', error);
            toast.error(error.response?.data?.message || 'Failed to register');
        } finally {
            setRegistering(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Event not found</h2>
                    <Link to="/events" className="btn btn-primary">Back to Events</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-100 py-12 px-4">
            <div className="container mx-auto max-w-4xl">
                <div className="card bg-base-200 shadow-xl">
                    <div className="card-body">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-lg">
                                        <FaCalendar className="text-primary" />
                                        <span>{new Date(event.eventDate).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-lg">
                                        <FaMapMarkerAlt className="text-primary" />
                                        <span>{event.location}</span>
                                    </div>
                                    {event.maxAttendees && (
                                        <div className="flex items-center gap-2 text-lg">
                                            <FaUsers className="text-primary" />
                                            <span>Max Attendees: {event.maxAttendees}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-base-content/60">Event Fee</p>
                                <p className="text-3xl font-bold text-primary">
                                    {event.isPaid ? `$${event.eventFee}` : 'Free'}
                                </p>
                            </div>
                        </div>

                        <div className="divider"></div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-3">About This Event</h2>
                            <p className="text-base-content/80 text-lg">{event.description}</p>
                        </div>

                        <div className="card-actions justify-end mt-6">
                            <button
                                onClick={handleRegister}
                                className="btn btn-primary btn-lg"
                                disabled={registering}
                            >
                                {registering ? <span className="loading loading-spinner"></span> : 'Register for Event'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;

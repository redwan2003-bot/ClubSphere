import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';

const EventRegistrations = () => {
    const [selectedEventId, setSelectedEventId] = useState('');

    const { data: eventsData } = useQuery({
        queryKey: ['myEvents'],
        queryFn: async () => {
            const response = await api.get('/api/events/my-events');
            return response.data;
        },
    });

    const { data: registrationsData, isLoading: registrationsLoading } = useQuery({
        queryKey: ['eventRegistrations', selectedEventId],
        queryFn: async () => {
            if (!selectedEventId) return { registrations: [] };
            const response = await api.get(`/api/event-registrations/event/${selectedEventId}`);
            return response.data;
        },
        enabled: !!selectedEventId,
    });

    const events = eventsData?.events || [];
    const registrations = registrationsData?.registrations || [];

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Event Registrations</h1>

            <div className="form-control mb-6">
                <label className="label"><span className="label-text">Select Event</span></label>
                <select
                    className="select select-bordered w-full max-w-xs"
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                >
                    <option value="">Choose an event</option>
                    {events.map((event) => (
                        <option key={event._id} value={event._id}>{event.title}</option>
                    ))}
                </select>
            </div>

            {selectedEventId && (
                <div className="card bg-base-200 shadow-xl">
                    <div className="card-body">
                        {registrationsLoading ? (
                            <div className="flex justify-center py-12">
                                <span className="loading loading-spinner loading-lg"></span>
                            </div>
                        ) : registrations.length === 0 ? (
                            <p className="text-base-content/60">No registrations yet</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="table table-zebra">
                                    <thead>
                                        <tr>
                                            <th>Participant</th>
                                            <th>Email</th>
                                            <th>Status</th>
                                            <th>Registered</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {registrations.map((registration) => (
                                            <tr key={registration._id}>
                                                <td>
                                                    <div className="flex items-center gap-3">
                                                        <div className="avatar">
                                                            <div className="mask mask-squircle w-12 h-12">
                                                                <img src={registration.user?.photoURL || `https://ui-avatars.com/api/?name=${registration.user?.name}`} alt={registration.user?.name} />
                                                            </div>
                                                        </div>
                                                        <div className="font-semibold">{registration.user?.name}</div>
                                                    </div>
                                                </td>
                                                <td>{registration.userEmail}</td>
                                                <td>
                                                    <span className={`badge ${registration.status === 'registered' ? 'badge-success' : 'badge-error'}`}>
                                                        {registration.status}
                                                    </span>
                                                </td>
                                                <td>{new Date(registration.registeredAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventRegistrations;

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const MyEvents = () => {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['myRegistrations'],
        queryFn: async () => {
            const response = await api.get('/api/event-registrations/my-registrations');
            return response.data;
        },
    });

    const cancelMutation = useMutation({
        mutationFn: async (id) => {
            const response = await api.patch(`/api/event-registrations/${id}/cancel`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['myRegistrations']);
            toast.success('Registration cancelled successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to cancel registration');
        },
    });

    const registrations = data?.registrations || [];

    const handleCancel = (id) => {
        if (confirm('Are you sure you want to cancel this registration?')) {
            cancelMutation.mutate(id);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">My Events</h1>

            {registrations.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-xl text-base-content/60 mb-4">You haven't registered for any events yet</p>
                    <Link to="/events" className="btn btn-primary">Browse Events</Link>
                </div>
            ) : (
                <div className="card bg-base-200 shadow-xl">
                    <div className="card-body">
                        <div className="overflow-x-auto">
                            <table className="table table-zebra">
                                <thead>
                                    <tr>
                                        <th>Event</th>
                                        <th>Club</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {registrations.map((registration) => (
                                        <tr key={registration._id}>
                                            <td className="font-semibold">{registration.event?.title}</td>
                                            <td>{registration.club?.clubName}</td>
                                            <td>{new Date(registration.event?.eventDate).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`badge ${registration.status === 'registered' ? 'badge-success' : 'badge-error'}`}>
                                                    {registration.status}
                                                </span>
                                            </td>
                                            <td>
                                                {registration.status === 'registered' && (
                                                    <button
                                                        className="btn btn-sm btn-error"
                                                        onClick={() => handleCancel(registration._id)}
                                                        disabled={cancelMutation.isLoading}
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyEvents;

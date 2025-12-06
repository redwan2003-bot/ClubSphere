import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import { FaUsers, FaCalendar, FaDollarSign } from 'react-icons/fa';

const ManagerOverview = () => {
    const { data: clubsData } = useQuery({
        queryKey: ['myClubs'],
        queryFn: async () => {
            const response = await api.get('/api/clubs/my-clubs');
            return response.data;
        },
    });

    const { data: eventsData } = useQuery({
        queryKey: ['myEvents'],
        queryFn: async () => {
            const response = await api.get('/api/events/my-events');
            return response.data;
        },
    });

    const clubs = clubsData?.clubs || [];
    const events = eventsData?.events || [];

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Manager Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="stat bg-base-200 rounded-lg shadow">
                    <div className="stat-figure text-primary">
                        <FaUsers className="text-4xl" />
                    </div>
                    <div className="stat-title">Clubs Managed</div>
                    <div className="stat-value text-primary">{clubs.length}</div>
                </div>

                <div className="stat bg-base-200 rounded-lg shadow">
                    <div className="stat-figure text-secondary">
                        <FaCalendar className="text-4xl" />
                    </div>
                    <div className="stat-title">Total Events</div>
                    <div className="stat-value text-secondary">{events.length}</div>
                </div>

                <div className="stat bg-base-200 rounded-lg shadow">
                    <div className="stat-figure text-accent">
                        <FaDollarSign className="text-4xl" />
                    </div>
                    <div className="stat-title">Approved Clubs</div>
                    <div className="stat-value text-accent">
                        {clubs.filter(c => c.status === 'approved').length}
                    </div>
                </div>
            </div>

            {/* Clubs Overview */}
            <div className="card bg-base-200 shadow-xl mb-6">
                <div className="card-body">
                    <h2 className="card-title">Your Clubs</h2>
                    {clubs.length === 0 ? (
                        <p className="text-base-content/60">You haven't created any clubs yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Club Name</th>
                                        <th>Category</th>
                                        <th>Status</th>
                                        <th>Fee</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clubs.map((club) => (
                                        <tr key={club._id}>
                                            <td className="font-semibold">{club.clubName}</td>
                                            <td><span className="badge badge-primary">{club.category}</span></td>
                                            <td>
                                                <span className={`badge ${club.status === 'approved' ? 'badge-success' :
                                                        club.status === 'pending' ? 'badge-warning' :
                                                            'badge-error'
                                                    }`}>
                                                    {club.status}
                                                </span>
                                            </td>
                                            <td>${club.membershipFee}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Upcoming Events */}
            <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">Upcoming Events</h2>
                    {events.length === 0 ? (
                        <p className="text-base-content/60">No upcoming events.</p>
                    ) : (
                        <div className="space-y-3">
                            {events.slice(0, 5).map((event) => (
                                <div key={event._id} className="flex justify-between items-center p-3 bg-base-100 rounded">
                                    <div>
                                        <p className="font-semibold">{event.title}</p>
                                        <p className="text-sm text-base-content/60">
                                            {new Date(event.eventDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className="badge">{event.isPaid ? `$${event.eventFee}` : 'Free'}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManagerOverview;

import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import { FaUsers, FaCalendar } from 'react-icons/fa';

const MemberOverview = () => {
    const { data: membershipsData } = useQuery({
        queryKey: ['myMemberships'],
        queryFn: async () => {
            const response = await api.get('/api/memberships/my-memberships');
            return response.data;
        },
    });

    const { data: registrationsData } = useQuery({
        queryKey: ['myRegistrations'],
        queryFn: async () => {
            const response = await api.get('/api/event-registrations/my-registrations');
            return response.data;
        },
    });

    const memberships = membershipsData?.memberships || [];
    const registrations = registrationsData?.registrations || [];
    const upcomingEvents = registrations.filter(r => new Date(r.event?.eventDate) > new Date()).slice(0, 5);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Member Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="stat bg-base-200 rounded-lg shadow">
                    <div className="stat-figure text-primary">
                        <FaUsers className="text-4xl" />
                    </div>
                    <div className="stat-title">Clubs Joined</div>
                    <div className="stat-value text-primary">{memberships.length}</div>
                </div>

                <div className="stat bg-base-200 rounded-lg shadow">
                    <div className="stat-figure text-secondary">
                        <FaCalendar className="text-4xl" />
                    </div>
                    <div className="stat-title">Events Registered</div>
                    <div className="stat-value text-secondary">{registrations.length}</div>
                </div>
            </div>

            {/* Upcoming Events */}
            <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">Upcoming Events</h2>
                    {upcomingEvents.length === 0 ? (
                        <p className="text-base-content/60">No upcoming events</p>
                    ) : (
                        <div className="space-y-3">
                            {upcomingEvents.map((registration) => (
                                <div key={registration._id} className="flex justify-between items-center p-3 bg-base-100 rounded">
                                    <div>
                                        <p className="font-semibold">{registration.event?.title}</p>
                                        <p className="text-sm text-base-content/60">
                                            {registration.club?.clubName} • {new Date(registration.event?.eventDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className="badge">{registration.event?.isPaid ? `$${registration.event?.eventFee}` : 'Free'}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MemberOverview;

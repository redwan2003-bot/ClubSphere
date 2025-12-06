import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../../services/api';

const MyClubsMember = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['myMemberships'],
        queryFn: async () => {
            const response = await api.get('/api/memberships/my-memberships');
            return response.data;
        },
    });

    const memberships = data?.memberships || [];

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">My Clubs</h1>

            {memberships.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-xl text-base-content/60 mb-4">You haven't joined any clubs yet</p>
                    <Link to="/clubs" className="btn btn-primary">Browse Clubs</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {memberships.map((membership) => (
                        <div key={membership._id} className="card bg-base-200 shadow-xl">
                            <figure className="h-48">
                                <img
                                    src={membership.club?.bannerImage || 'https://via.placeholder.com/400x300?text=Club'}
                                    alt={membership.club?.clubName}
                                    className="w-full h-full object-cover"
                                />
                            </figure>
                            <div className="card-body">
                                <h2 className="card-title">{membership.club?.clubName}</h2>
                                <p className="text-sm text-base-content/70 line-clamp-2">
                                    {membership.club?.description}
                                </p>
                                <div className="flex gap-2 mt-2">
                                    <span className="badge badge-primary">{membership.club?.category}</span>
                                    <span className={`badge ${membership.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                                        {membership.status}
                                    </span>
                                </div>
                                <div className="text-sm text-base-content/60 mt-2">
                                    Joined: {new Date(membership.joinedAt).toLocaleDateString()}
                                </div>
                                <div className="card-actions justify-end mt-4">
                                    <Link to={`/clubs/${membership.club?._id}`} className="btn btn-primary btn-sm">
                                        View Club
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyClubsMember;

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';

const ClubMembers = () => {
    const [selectedClubId, setSelectedClubId] = useState('');

    const { data: clubsData } = useQuery({
        queryKey: ['myClubs'],
        queryFn: async () => {
            const response = await api.get('/api/clubs/my-clubs');
            return response.data;
        },
    });

    const { data: membersData, isLoading: membersLoading } = useQuery({
        queryKey: ['clubMembers', selectedClubId],
        queryFn: async () => {
            if (!selectedClubId) return { memberships: [] };
            const response = await api.get(`/api/memberships/club/${selectedClubId}`);
            return response.data;
        },
        enabled: !!selectedClubId,
    });

    const clubs = clubsData?.clubs || [];
    const members = membersData?.memberships || [];

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Club Members</h1>

            <div className="form-control mb-6">
                <label className="label"><span className="label-text">Select Club</span></label>
                <select
                    className="select select-bordered w-full max-w-xs"
                    value={selectedClubId}
                    onChange={(e) => setSelectedClubId(e.target.value)}
                >
                    <option value="">Choose a club</option>
                    {clubs.map((club) => (
                        <option key={club._id} value={club._id}>{club.clubName}</option>
                    ))}
                </select>
            </div>

            {selectedClubId && (
                <div className="card bg-base-200 shadow-xl">
                    <div className="card-body">
                        {membersLoading ? (
                            <div className="flex justify-center py-12">
                                <span className="loading loading-spinner loading-lg"></span>
                            </div>
                        ) : members.length === 0 ? (
                            <p className="text-base-content/60">No members yet</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="table table-zebra">
                                    <thead>
                                        <tr>
                                            <th>Member</th>
                                            <th>Email</th>
                                            <th>Status</th>
                                            <th>Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {members.map((membership) => (
                                            <tr key={membership._id}>
                                                <td>
                                                    <div className="flex items-center gap-3">
                                                        <div className="avatar">
                                                            <div className="mask mask-squircle w-12 h-12">
                                                                <img src={membership.user?.photoURL || `https://ui-avatars.com/api/?name=${membership.user?.name}`} alt={membership.user?.name} />
                                                            </div>
                                                        </div>
                                                        <div className="font-semibold">{membership.user?.name}</div>
                                                    </div>
                                                </td>
                                                <td>{membership.userEmail}</td>
                                                <td>
                                                    <span className={`badge ${membership.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                                                        {membership.status}
                                                    </span>
                                                </td>
                                                <td>{new Date(membership.joinedAt).toLocaleDateString()}</td>
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

export default ClubMembers;

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const ManageClubs = () => {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState('pending');

    const { data, isLoading } = useQuery({
        queryKey: ['adminClubs', filter],
        queryFn: async () => {
            if (filter === 'pending') {
                const response = await api.get('/api/clubs/pending');
                return response.data;
            } else {
                const response = await api.get(`/api/clubs?sort=newest`);
                return { clubs: response.data.clubs.filter(c => !filter || c.status === filter) };
            }
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ clubId, status }) => {
            const response = await api.patch(`/api/clubs/${clubId}/status`, { status });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['adminClubs']);
            toast.success('Club status updated successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update status');
        },
    });

    const clubs = data?.clubs || [];

    const handleStatusChange = (clubId, status) => {
        updateStatusMutation.mutate({ clubId, status });
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
            <h1 className="text-3xl font-bold mb-8">Manage Clubs</h1>

            {/* Filter */}
            <div className="mb-6">
                <div className="tabs tabs-boxed">
                    <button
                        className={`tab ${filter === 'pending' ? 'tab-active' : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        Pending
                    </button>
                    <button
                        className={`tab ${filter === 'approved' ? 'tab-active' : ''}`}
                        onClick={() => setFilter('approved')}
                    >
                        Approved
                    </button>
                    <button
                        className={`tab ${filter === 'rejected' ? 'tab-active' : ''}`}
                        onClick={() => setFilter('rejected')}
                    >
                        Rejected
                    </button>
                    <button
                        className={`tab ${filter === '' ? 'tab-active' : ''}`}
                        onClick={() => setFilter('')}
                    >
                        All
                    </button>
                </div>
            </div>

            <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                    <div className="overflow-x-auto">
                        <table className="table table-zebra">
                            <thead>
                                <tr>
                                    <th>Club Name</th>
                                    <th>Manager</th>
                                    <th>Category</th>
                                    <th>Fee</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clubs.map((club) => (
                                    <tr key={club._id}>
                                        <td className="font-semibold">{club.clubName}</td>
                                        <td>{club.managerEmail}</td>
                                        <td>
                                            <span className="badge badge-primary">{club.category}</span>
                                        </td>
                                        <td>${club.membershipFee}</td>
                                        <td>
                                            <span className={`badge ${club.status === 'approved' ? 'badge-success' :
                                                    club.status === 'pending' ? 'badge-warning' :
                                                        'badge-error'
                                                }`}>
                                                {club.status}
                                            </span>
                                        </td>
                                        <td>
                                            {club.status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        className="btn btn-success btn-sm"
                                                        onClick={() => handleStatusChange(club._id, 'approved')}
                                                        disabled={updateStatusMutation.isLoading}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        className="btn btn-error btn-sm"
                                                        onClick={() => handleStatusChange(club._id, 'rejected')}
                                                        disabled={updateStatusMutation.isLoading}
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageClubs;

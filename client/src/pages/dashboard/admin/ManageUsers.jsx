import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const ManageUsers = () => {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await api.get('/api/users');
            return response.data;
        },
    });

    const updateRoleMutation = useMutation({
        mutationFn: async ({ email, role }) => {
            const response = await api.patch(`/api/users/${email}/role`, { role });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            toast.success('User role updated successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update role');
        },
    });

    const users = data?.users || [];

    const handleRoleChange = (email, newRole) => {
        updateRoleMutation.mutate({ email, role: newRole });
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
            <h1 className="text-3xl font-bold mb-8">Manage Users</h1>

            <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                    <div className="overflow-x-auto">
                        <table className="table table-zebra">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user._id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="avatar">
                                                    <div className="mask mask-squircle w-12 h-12">
                                                        <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.name}`} alt={user.name} />
                                                    </div>
                                                </div>
                                                <div className="font-semibold">{user.name}</div>
                                            </div>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className={`badge ${user.role === 'admin' ? 'badge-error' :
                                                    user.role === 'clubManager' ? 'badge-warning' :
                                                        'badge-info'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <select
                                                className="select select-bordered select-sm"
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.email, e.target.value)}
                                                disabled={updateRoleMutation.isLoading}
                                            >
                                                <option value="member">Member</option>
                                                <option value="clubManager">Club Manager</option>
                                                <option value="admin">Admin</option>
                                            </select>
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

export default ManageUsers;

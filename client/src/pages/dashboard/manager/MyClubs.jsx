import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api from '../../../services/api';
import toast from 'react-hot-toast';


const MyClubs = () => {
    const queryClient = useQueryClient();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingClub, setEditingClub] = useState(null);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const { data, isLoading } = useQuery({
        queryKey: ['myClubs'],
        queryFn: async () => {
            const response = await api.get('/api/clubs/my-clubs');
            return response.data;
        },
    });

    const createMutation = useMutation({
        mutationFn: async (clubData) => {
            const response = await api.post('/api/clubs', clubData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['myClubs']);
            toast.success('Club created successfully! Awaiting admin approval.');
            setShowCreateForm(false);
            reset();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to create club');
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await api.patch(`/api/clubs/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['myClubs']);
            toast.success('Club updated successfully');
            setEditingClub(null);
            reset();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update club');
        },
    });

    const clubs = data?.clubs || [];

    const onSubmit = (data) => {
        if (editingClub) {
            updateMutation.mutate({ id: editingClub._id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (club) => {
        setEditingClub(club);
        reset(club);
        setShowCreateForm(true);
    };

    const handleCancel = () => {
        setShowCreateForm(false);
        setEditingClub(null);
        reset();
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
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">My Clubs</h1>
                {!showCreateForm && (
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowCreateForm(true)}
                    >
                        Create New Club
                    </button>
                )}
            </div>

            {/* Create/Edit Form */}
            {showCreateForm && (
                <div className="card bg-base-200 shadow-xl mb-8">
                    <div className="card-body">
                        <h2 className="card-title">{editingClub ? 'Edit Club' : 'Create New Club'}</h2>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label"><span className="label-text">Club Name</span></label>
                                    <input
                                        type="text"
                                        className={`input input-bordered ${errors.clubName ? 'input-error' : ''}`}
                                        {...register('clubName', { required: 'Club name is required' })}
                                    />
                                    {errors.clubName && <span className="text-error text-sm">{errors.clubName.message}</span>}
                                </div>

                                <div className="form-control">
                                    <label className="label"><span className="label-text">Category</span></label>
                                    <select
                                        className={`select select-bordered ${errors.category ? 'select-error' : ''}`}
                                        {...register('category', { required: 'Category is required' })}
                                    >
                                        <option value="">Select category</option>
                                        <option value="Photography">Photography</option>
                                        <option value="Sports">Sports</option>
                                        <option value="Tech">Tech</option>
                                        <option value="Books">Books</option>
                                        <option value="Music">Music</option>
                                        <option value="Art">Art</option>
                                        <option value="Gaming">Gaming</option>
                                        <option value="Fitness">Fitness</option>
                                    </select>
                                    {errors.category && <span className="text-error text-sm">{errors.category.message}</span>}
                                </div>

                                <div className="form-control">
                                    <label className="label"><span className="label-text">Location</span></label>
                                    <input
                                        type="text"
                                        className={`input input-bordered ${errors.location ? 'input-error' : ''}`}
                                        {...register('location', { required: 'Location is required' })}
                                    />
                                    {errors.location && <span className="text-error text-sm">{errors.location.message}</span>}
                                </div>

                                <div className="form-control">
                                    <label className="label"><span className="label-text">Membership Fee ($)</span></label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="input input-bordered"
                                        {...register('membershipFee')}
                                        defaultValue={0}
                                    />
                                </div>
                            </div>

                            <div className="form-control">
                                <label className="label"><span className="label-text">Description</span></label>
                                <textarea
                                    className={`textarea textarea-bordered h-24 ${errors.description ? 'textarea-error' : ''}`}
                                    {...register('description', { required: 'Description is required' })}
                                ></textarea>
                                {errors.description && <span className="text-error text-sm">{errors.description.message}</span>}
                            </div>

                            <div className="form-control">
                                <label className="label"><span className="label-text">Banner Image URL</span></label>
                                <input
                                    type="url"
                                    className="input input-bordered"
                                    {...register('bannerImage')}
                                />
                            </div>

                            <div className="flex gap-2">
                                <button type="submit" className="btn btn-primary" disabled={createMutation.isLoading || updateMutation.isLoading}>
                                    {(createMutation.isLoading || updateMutation.isLoading) ? <span className="loading loading-spinner"></span> : (editingClub ? 'Update Club' : 'Create Club')}
                                </button>
                                <button type="button" className="btn btn-ghost" onClick={handleCancel}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Clubs List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {clubs.map((club) => (
                    <div key={club._id} className="card bg-base-200 shadow-xl">
                        <figure className="h-48">
                            <img src={club.bannerImage || 'https://via.placeholder.com/400x300?text=Club'} alt={club.clubName} className="w-full h-full object-cover" />
                        </figure>
                        <div className="card-body">
                            <h2 className="card-title">{club.clubName}</h2>
                            <p className="text-sm text-base-content/70 line-clamp-2">{club.description}</p>
                            <div className="flex gap-2 mt-2">
                                <span className="badge badge-primary">{club.category}</span>
                                <span className={`badge ${club.status === 'approved' ? 'badge-success' :
                                    club.status === 'pending' ? 'badge-warning' :
                                        'badge-error'
                                    }`}>
                                    {club.status}
                                </span>
                            </div>
                            <div className="card-actions justify-end mt-4">
                                <button className="btn btn-sm btn-primary" onClick={() => handleEdit(club)}>
                                    Edit
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {clubs.length === 0 && !showCreateForm && (
                <div className="text-center py-12">
                    <p className="text-xl text-base-content/60 mb-4">You haven't created any clubs yet</p>
                    <button className="btn btn-primary" onClick={() => setShowCreateForm(true)}>
                        Create Your First Club
                    </button>
                </div>
            )}
        </div>
    );
};

export default MyClubs;

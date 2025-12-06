import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const EventsManagement = () => {
    const queryClient = useQueryClient();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const { data: clubsData } = useQuery({
        queryKey: ['myClubs'],
        queryFn: async () => {
            const response = await api.get('/api/clubs/my-clubs');
            return response.data;
        },
    });

    const { data: eventsData, isLoading } = useQuery({
        queryKey: ['myEvents'],
        queryFn: async () => {
            const response = await api.get('/api/events/my-events');
            return response.data;
        },
    });

    const createMutation = useMutation({
        mutationFn: async (eventData) => {
            const response = await api.post('/api/events', eventData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['myEvents']);
            toast.success('Event created successfully');
            setShowCreateForm(false);
            reset();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to create event');
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await api.patch(`/api/events/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['myEvents']);
            toast.success('Event updated successfully');
            setEditingEvent(null);
            setShowCreateForm(false);
            reset();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update event');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const response = await api.delete(`/api/events/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['myEvents']);
            toast.success('Event deleted successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete event');
        },
    });

    const clubs = clubsData?.clubs?.filter(c => c.status === 'approved') || [];
    const events = eventsData?.events || [];

    const onSubmit = (data) => {
        const eventData = {
            ...data,
            isPaid: data.isPaid === 'true',
            eventFee: data.isPaid === 'true' ? parseFloat(data.eventFee) : 0,
            maxAttendees: data.maxAttendees ? parseInt(data.maxAttendees) : null,
        };

        if (editingEvent) {
            updateMutation.mutate({ id: editingEvent._id, data: eventData });
        } else {
            createMutation.mutate(eventData);
        }
    };

    const handleEdit = (event) => {
        setEditingEvent(event);
        reset({
            ...event,
            eventDate: new Date(event.eventDate).toISOString().split('T')[0],
            isPaid: event.isPaid.toString(),
        });
        setShowCreateForm(true);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this event?')) {
            deleteMutation.mutate(id);
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
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Events Management</h1>
                {!showCreateForm && clubs.length > 0 && (
                    <button className="btn btn-primary" onClick={() => setShowCreateForm(true)}>
                        Create New Event
                    </button>
                )}
            </div>

            {clubs.length === 0 && (
                <div className="alert alert-warning mb-6">
                    <span>You need to have at least one approved club to create events.</span>
                </div>
            )}

            {/* Create/Edit Form */}
            {showCreateForm && (
                <div className="card bg-base-200 shadow-xl mb-8">
                    <div className="card-body">
                        <h2 className="card-title">{editingEvent ? 'Edit Event' : 'Create New Event'}</h2>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label"><span className="label-text">Club</span></label>
                                    <select
                                        className={`select select-bordered ${errors.clubId ? 'select-error' : ''}`}
                                        {...register('clubId', { required: 'Club is required' })}
                                    >
                                        <option value="">Select club</option>
                                        {clubs.map((club) => (
                                            <option key={club._id} value={club._id}>{club.clubName}</option>
                                        ))}
                                    </select>
                                    {errors.clubId && <span className="text-error text-sm">{errors.clubId.message}</span>}
                                </div>

                                <div className="form-control">
                                    <label className="label"><span className="label-text">Event Title</span></label>
                                    <input
                                        type="text"
                                        className={`input input-bordered ${errors.title ? 'input-error' : ''}`}
                                        {...register('title', { required: 'Title is required' })}
                                    />
                                    {errors.title && <span className="text-error text-sm">{errors.title.message}</span>}
                                </div>

                                <div className="form-control">
                                    <label className="label"><span className="label-text">Event Date</span></label>
                                    <input
                                        type="date"
                                        className={`input input-bordered ${errors.eventDate ? 'input-error' : ''}`}
                                        {...register('eventDate', { required: 'Date is required' })}
                                    />
                                    {errors.eventDate && <span className="text-error text-sm">{errors.eventDate.message}</span>}
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
                                    <label className="label"><span className="label-text">Is Paid Event?</span></label>
                                    <select className="select select-bordered" {...register('isPaid')}>
                                        <option value="false">Free</option>
                                        <option value="true">Paid</option>
                                    </select>
                                </div>

                                <div className="form-control">
                                    <label className="label"><span className="label-text">Event Fee ($)</span></label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="input input-bordered"
                                        {...register('eventFee')}
                                        defaultValue={0}
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label"><span className="label-text">Max Attendees (optional)</span></label>
                                    <input
                                        type="number"
                                        className="input input-bordered"
                                        {...register('maxAttendees')}
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

                            <div className="flex gap-2">
                                <button type="submit" className="btn btn-primary" disabled={createMutation.isLoading || updateMutation.isLoading}>
                                    {(createMutation.isLoading || updateMutation.isLoading) ? <span className="loading loading-spinner"></span> : (editingEvent ? 'Update Event' : 'Create Event')}
                                </button>
                                <button type="button" className="btn btn-ghost" onClick={() => { setShowCreateForm(false); setEditingEvent(null); reset(); }}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Events List */}
            <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                    {events.length === 0 ? (
                        <p className="text-base-content/60">No events created yet</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table table-zebra">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Date</th>
                                        <th>Location</th>
                                        <th>Fee</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {events.map((event) => (
                                        <tr key={event._id}>
                                            <td className="font-semibold">{event.title}</td>
                                            <td>{new Date(event.eventDate).toLocaleDateString()}</td>
                                            <td>{event.location}</td>
                                            <td>{event.isPaid ? `$${event.eventFee}` : 'Free'}</td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <button className="btn btn-sm btn-primary" onClick={() => handleEdit(event)}>
                                                        Edit
                                                    </button>
                                                    <button className="btn btn-sm btn-error" onClick={() => handleDelete(event._id)}>
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventsManagement;

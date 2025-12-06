import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { FaSearch, FaCalendar, FaMapMarkerAlt } from 'react-icons/fa';

const Events = () => {
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['events', search, sort],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (sort) params.append('sort', sort);

            const response = await api.get(`/api/events?${params.toString()}`);
            return response.data;
        },
    });

    const events = data?.events || [];

    return (
        <div className="min-h-screen bg-base-100 py-12 px-4">
            <div className="container mx-auto">
                <h1 className="text-4xl font-bold text-center mb-8">Upcoming Events</h1>

                {/* Search and Filters */}
                <div className="bg-base-200 p-6 rounded-lg mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Search */}
                        <div className="form-control">
                            <div className="input-group">
                                <input
                                    type="text"
                                    placeholder="Search events..."
                                    className="input input-bordered w-full"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <button className="btn btn-square btn-primary">
                                    <FaSearch />
                                </button>
                            </div>
                        </div>

                        {/* Sort */}
                        <div className="form-control">
                            <select
                                className="select select-bordered w-full"
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                            >
                                <option value="">Earliest First</option>
                                <option value="latest">Latest First</option>
                                <option value="newest">Newest Created</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Events Grid */}
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-xl text-base-content/60">No upcoming events found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event) => (
                            <div key={event._id} className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all">
                                <div className="card-body">
                                    <h2 className="card-title">{event.title}</h2>
                                    <p className="text-sm text-base-content/70 line-clamp-3">
                                        {event.description}
                                    </p>

                                    <div className="space-y-2 mt-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <FaCalendar className="text-primary" />
                                            <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <FaMapMarkerAlt className="text-primary" />
                                            <span>{event.location}</span>
                                        </div>
                                    </div>

                                    <div className="card-actions justify-between items-center mt-4">
                                        <span className="font-semibold text-lg">
                                            {event.isPaid ? `$${event.eventFee}` : 'Free'}
                                        </span>
                                        <Link to={`/events/${event._id}`} className="btn btn-primary btn-sm">
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Events;

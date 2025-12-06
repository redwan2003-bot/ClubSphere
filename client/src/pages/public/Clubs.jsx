import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { FaSearch } from 'react-icons/fa';

const Clubs = () => {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [sort, setSort] = useState('newest');

    const { data, isLoading } = useQuery({
        queryKey: ['clubs', search, category, sort],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (category) params.append('category', category);
            if (sort) params.append('sort', sort);

            const response = await api.get(`/api/clubs?${params.toString()}`);
            return response.data;
        },
    });

    const clubs = data?.clubs || [];
    const categories = ['Photography', 'Sports', 'Tech', 'Books', 'Music', 'Art', 'Gaming', 'Fitness'];

    return (
        <div className="min-h-screen bg-base-100 py-12 px-4">
            <div className="container mx-auto">
                <h1 className="text-4xl font-bold text-center mb-8">Browse Clubs</h1>

                {/* Search and Filters */}
                <div className="bg-base-200 p-6 rounded-lg mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="form-control">
                            <div className="input-group">
                                <input
                                    type="text"
                                    placeholder="Search clubs..."
                                    className="input input-bordered w-full"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <button className="btn btn-square btn-primary">
                                    <FaSearch />
                                </button>
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="form-control">
                            <select
                                className="select select-bordered w-full"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sort */}
                        <div className="form-control">
                            <select
                                className="select select-bordered w-full"
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="highestFee">Highest Fee</option>
                                <option value="lowestFee">Lowest Fee</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Clubs Grid */}
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : clubs.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-xl text-base-content/60">No clubs found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {clubs.map((club) => (
                            <div key={club._id} className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all">
                                <figure className="h-48 overflow-hidden">
                                    <img
                                        src={club.bannerImage || 'https://via.placeholder.com/400x300?text=Club'}
                                        alt={club.clubName}
                                        className="w-full h-full object-cover"
                                    />
                                </figure>
                                <div className="card-body">
                                    <h2 className="card-title">{club.clubName}</h2>
                                    <p className="text-sm text-base-content/70 line-clamp-2">
                                        {club.description}
                                    </p>
                                    <div className="flex items-center gap-2 text-sm mt-2">
                                        <span className="badge badge-primary">{club.category}</span>
                                        <span className="text-base-content/60">{club.location}</span>
                                    </div>
                                    <div className="card-actions justify-between items-center mt-4">
                                        <span className="font-semibold text-lg">
                                            {club.membershipFee === 0 ? 'Free' : `$${club.membershipFee}`}
                                        </span>
                                        <Link to={`/clubs/${club._id}`} className="btn btn-primary btn-sm">
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

export default Clubs;

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { FaUsers, FaCalendar, FaRocket, FaHeart } from 'react-icons/fa';

const Home = () => {
    // Fetch featured clubs
    const { data: clubsData, isLoading } = useQuery({
        queryKey: ['featuredClubs'],
        queryFn: async () => {
            const response = await api.get('/api/clubs?sort=newest');
            return response.data;
        },
    });

    const featuredClubs = clubsData?.clubs?.slice(0, 6) || [];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="hero min-h-[600px] bg-gradient-to-r from-primary/20 to-secondary/20 relative overflow-hidden"
            >
                <div className="hero-content text-center z-10">
                    <div className="max-w-3xl">
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="text-5xl md:text-6xl font-bold mb-6"
                        >
                            Discover Your <span className="text-primary">Community</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="text-lg md:text-xl mb-8"
                        >
                            Join local clubs, connect with like-minded people, and participate in exciting events.
                            Your next adventure starts here!
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.6 }}
                            className="flex gap-4 justify-center flex-wrap"
                        >
                            <Link to="/clubs" className="btn btn-primary btn-lg">
                                Browse Clubs
                            </Link>
                            <Link to="/register" className="btn btn-outline btn-lg">
                                Join Now
                            </Link>
                        </motion.div>
                    </div>
                </div>

                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-secondary/5 to-transparent pointer-events-none" />
            </motion.section>

            {/* Featured Clubs Section */}
            <section className="py-16 px-4 bg-base-100">
                <div className="container mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl font-bold mb-4">Featured Clubs</h2>
                        <p className="text-lg text-base-content/70">
                            Discover popular clubs in your area
                        </p>
                    </motion.div>

                    {isLoading ? (
                        <div className="flex justify-center">
                            <span className="loading loading-spinner loading-lg"></span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredClubs.map((club, index) => (
                                <motion.div
                                    key={club._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                    whileHover={{ y: -5 }}
                                    className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all"
                                >
                                    <figure className="h-48 overflow-hidden">
                                        <img
                                            src={club.bannerImage || 'https://via.placeholder.com/400x300?text=Club'}
                                            alt={club.clubName}
                                            className="w-full h-full object-cover"
                                        />
                                    </figure>
                                    <div className="card-body">
                                        <h3 className="card-title">{club.clubName}</h3>
                                        <p className="text-sm text-base-content/70 line-clamp-2">
                                            {club.description}
                                        </p>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="badge badge-primary">{club.category}</span>
                                            <span className="text-base-content/60">{club.location}</span>
                                        </div>
                                        <div className="card-actions justify-between items-center mt-4">
                                            <span className="font-semibold">
                                                {club.membershipFee === 0 ? 'Free' : `$${club.membershipFee}`}
                                            </span>
                                            <Link to={`/clubs/${club._id}`} className="btn btn-primary btn-sm">
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-12">
                        <Link to="/clubs" className="btn btn-outline btn-lg">
                            View All Clubs
                        </Link>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-16 px-4 bg-base-200">
                <div className="container mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl font-bold mb-4">How ClubSphere Works</h2>
                        <p className="text-lg text-base-content/70">
                            Get started in three simple steps
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <FaUsers className="text-5xl text-primary" />,
                                title: 'Browse Clubs',
                                description: 'Explore local clubs based on your interests and location',
                            },
                            {
                                icon: <FaHeart className="text-5xl text-primary" />,
                                title: 'Join & Connect',
                                description: 'Become a member and connect with like-minded people',
                            },
                            {
                                icon: <FaCalendar className="text-5xl text-primary" />,
                                title: 'Attend Events',
                                description: 'Participate in exciting events and activities',
                            },
                        ].map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2, duration: 0.6 }}
                                className="text-center p-6"
                            >
                                <div className="flex justify-center mb-4">{step.icon}</div>
                                <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                                <p className="text-base-content/70">{step.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Join Section */}
            <section className="py-16 px-4 bg-base-100">
                <div className="container mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl font-bold mb-4">Why Join a Club?</h2>
                        <p className="text-lg text-base-content/70">
                            Benefits of being part of a community
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {[
                            {
                                icon: <FaUsers className="text-3xl text-primary" />,
                                title: 'Build Connections',
                                description: 'Meet new people who share your passions and interests',
                            },
                            {
                                icon: <FaRocket className="text-3xl text-primary" />,
                                title: 'Learn & Grow',
                                description: 'Develop new skills and expand your knowledge',
                            },
                            {
                                icon: <FaCalendar className="text-3xl text-primary" />,
                                title: 'Exciting Events',
                                description: 'Access exclusive events and activities',
                            },
                            {
                                icon: <FaHeart className="text-3xl text-primary" />,
                                title: 'Give Back',
                                description: 'Contribute to your community and make a difference',
                            },
                        ].map((benefit, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.6 }}
                                className="flex gap-4 p-6 bg-base-200 rounded-lg"
                            >
                                <div className="flex-shrink-0">{benefit.icon}</div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                                    <p className="text-base-content/70">{benefit.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;

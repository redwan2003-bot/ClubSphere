import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

const Footer = () => {
    return (
        <footer className="bg-base-200 text-base-content">
            <div className="container mx-auto px-4 py-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* About Section */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">
                            <span className="text-primary">Club</span>Sphere
                        </h3>
                        <p className="text-sm">
                            Discover, join, and manage local clubs. Connect with like-minded people and participate in exciting events.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/" className="hover:text-primary transition">Home</Link></li>
                            <li><Link to="/clubs" className="hover:text-primary transition">Browse Clubs</Link></li>
                            <li><Link to="/events" className="hover:text-primary transition">Upcoming Events</Link></li>
                            <li><Link to="/register" className="hover:text-primary transition">Join Now</Link></li>
                        </ul>
                    </div>

                    {/* Contact & Social */}
                    <div>
                        <h4 className="font-semibold mb-4">Connect With Us</h4>
                        <p className="text-sm mb-4">
                            Email: contact@clubsphere.com<br />
                            Phone: +1 (555) 123-4567
                        </p>
                        <div className="flex gap-4">
                            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="btn btn-circle btn-sm btn-ghost">
                                <FaGithub className="text-xl" />
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="btn btn-circle btn-sm btn-ghost">
                                <FaLinkedin className="text-xl" />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="btn btn-circle btn-sm btn-ghost">
                                <FaXTwitter className="text-xl" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="divider"></div>

                <div className="text-center text-sm">
                    <p>&copy; {new Date().getFullYear()} ClubSphere. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

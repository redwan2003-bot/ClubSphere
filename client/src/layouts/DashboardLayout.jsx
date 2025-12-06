import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaHome, FaUsers, FaCalendar, FaDollarSign, FaChartBar, FaUsersCog } from 'react-icons/fa';

const DashboardLayout = () => {
    const { userProfile } = useAuth();

    const getMenuItems = () => {
        if (userProfile?.role === 'admin') {
            return [
                { path: '/dashboard/admin', label: 'Overview', icon: <FaHome /> },
                { path: '/dashboard/admin/users', label: 'Manage Users', icon: <FaUsersCog /> },
                { path: '/dashboard/admin/clubs', label: 'Manage Clubs', icon: <FaUsers /> },
                { path: '/dashboard/admin/payments', label: 'View Payments', icon: <FaDollarSign /> },
            ];
        } else if (userProfile?.role === 'clubManager') {
            return [
                { path: '/dashboard/manager', label: 'Overview', icon: <FaHome /> },
                { path: '/dashboard/manager/clubs', label: 'My Clubs', icon: <FaUsers /> },
                { path: '/dashboard/manager/members', label: 'Club Members', icon: <FaUsersCog /> },
                { path: '/dashboard/manager/events', label: 'Events', icon: <FaCalendar /> },
                { path: '/dashboard/manager/registrations', label: 'Registrations', icon: <FaChartBar /> },
            ];
        } else {
            return [
                { path: '/dashboard/member', label: 'Overview', icon: <FaHome /> },
                { path: '/dashboard/member/clubs', label: 'My Clubs', icon: <FaUsers /> },
                { path: '/dashboard/member/events', label: 'My Events', icon: <FaCalendar /> },
                { path: '/dashboard/member/payments', label: 'Payment History', icon: <FaDollarSign /> },
            ];
        }
    };

    const menuItems = getMenuItems();

    return (
        <div className="drawer lg:drawer-open">
            <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content flex flex-col">
                {/* Mobile Menu Button */}
                <div className="lg:hidden p-4 bg-base-200">
                    <label htmlFor="dashboard-drawer" className="btn btn-ghost drawer-button">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </label>
                </div>

                {/* Page Content */}
                <div className="p-4 lg:p-8">
                    <Outlet />
                </div>
            </div>

            {/* Sidebar */}
            <div className="drawer-side">
                <label htmlFor="dashboard-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
                <div className="menu p-4 w-64 min-h-full bg-base-200">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold">
                            <span className="text-primary">Club</span>Sphere
                        </h2>
                        <p className="text-sm text-base-content/60 mt-1">
                            {userProfile?.role === 'admin' ? 'Admin Dashboard' :
                                userProfile?.role === 'clubManager' ? 'Manager Dashboard' :
                                    'Member Dashboard'}
                        </p>
                    </div>

                    <ul className="space-y-2">
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    end={item.path.split('/').length === 3}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 ${isActive ? 'active bg-primary text-primary-content' : ''}`
                                    }
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>

                    <div className="divider"></div>

                    <ul>
                        <li>
                            <NavLink to="/" className="flex items-center gap-3">
                                <FaHome />
                                <span>Back to Home</span>
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;

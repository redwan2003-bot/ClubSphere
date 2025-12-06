import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
    const { user, userProfile, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    const navLinks = (
        <>
            <li><NavLink to="/" className={({ isActive }) => isActive ? 'text-primary font-semibold' : ''}>Home</NavLink></li>
            <li><NavLink to="/clubs" className={({ isActive }) => isActive ? 'text-primary font-semibold' : ''}>Clubs</NavLink></li>
            <li><NavLink to="/events" className={({ isActive }) => isActive ? 'text-primary font-semibold' : ''}>Events</NavLink></li>
        </>
    );

    return (
        <div className="navbar bg-base-100 shadow-md px-4 lg:px-8">
            <div className="navbar-start">
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                        </svg>
                    </div>
                    <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                        {navLinks}
                    </ul>
                </div>
                <Link to="/" className="btn btn-ghost text-xl font-bold">
                    <span className="text-primary">Club</span>Sphere
                </Link>
            </div>

            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1 gap-2">
                    {navLinks}
                </ul>
            </div>

            <div className="navbar-end gap-2">
                {user ? (
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                            <div className="w-10 rounded-full">
                                <img alt={user.displayName || 'User'} src={user.photoURL || 'https://ui-avatars.com/api/?name=' + (user.displayName || 'User')} />
                            </div>
                        </div>
                        <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                            <li className="menu-title">
                                <span>{user.displayName || user.email}</span>
                                <span className="text-xs text-primary">{userProfile?.role || 'member'}</span>
                            </li>
                            <li><Link to="/profile">Profile</Link></li>
                            <li>
                                <Link to={
                                    userProfile?.role === 'admin' ? '/dashboard/admin' :
                                        userProfile?.role === 'clubManager' ? '/dashboard/manager' :
                                            '/dashboard/member'
                                }>
                                    Dashboard
                                </Link>
                            </li>
                            <li><button onClick={handleLogout}>Logout</button></li>
                        </ul>
                    </div>
                ) : (
                    <>
                        <Link to="/login" className="btn btn-ghost">Login</Link>
                        <Link to="/register" className="btn btn-primary">Register</Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default Navbar;

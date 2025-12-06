import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import PrivateRoute from '../components/shared/PrivateRoute';
import ErrorPage from '../components/shared/ErrorPage';

// Public Pages
import Home from '../pages/public/Home';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';
import Clubs from '../pages/public/Clubs';
import ClubDetails from '../pages/public/ClubDetails';
import Events from '../pages/public/Events';
import EventDetails from '../pages/public/EventDetails';

// Admin Dashboard
import AdminOverview from '../pages/dashboard/admin/AdminOverview';
import ManageUsers from '../pages/dashboard/admin/ManageUsers';
import ManageClubs from '../pages/dashboard/admin/ManageClubs';
import ViewPayments from '../pages/dashboard/admin/ViewPayments';

// Manager Dashboard
import ManagerOverview from '../pages/dashboard/manager/ManagerOverview';
import MyClubs from '../pages/dashboard/manager/MyClubs';
import ClubMembers from '../pages/dashboard/manager/ClubMembers';
import EventsManagement from '../pages/dashboard/manager/EventsManagement';
import EventRegistrations from '../pages/dashboard/manager/EventRegistrations';

// Member Dashboard
import MemberOverview from '../pages/dashboard/member/MemberOverview';
import MyClubsMember from '../pages/dashboard/member/MyClubsMember';
import MyEvents from '../pages/dashboard/member/MyEvents';
import PaymentHistory from '../pages/dashboard/member/PaymentHistory';

const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        errorElement: <ErrorPage />,
        children: [
            { index: true, element: <Home /> },
            { path: 'login', element: <Login /> },
            { path: 'register', element: <Register /> },
            { path: 'clubs', element: <Clubs /> },
            { path: 'clubs/:id', element: <ClubDetails /> },
            { path: 'events', element: <Events /> },
            { path: 'events/:id', element: <EventDetails /> },
        ],
    },
    {
        path: '/dashboard/admin',
        element: (
            <PrivateRoute requiredRole="admin">
                <DashboardLayout />
            </PrivateRoute>
        ),
        errorElement: <ErrorPage />,
        children: [
            { index: true, element: <AdminOverview /> },
            { path: 'users', element: <ManageUsers /> },
            { path: 'clubs', element: <ManageClubs /> },
            { path: 'payments', element: <ViewPayments /> },
        ],
    },
    {
        path: '/dashboard/manager',
        element: (
            <PrivateRoute requiredRole="clubManager">
                <DashboardLayout />
            </PrivateRoute>
        ),
        errorElement: <ErrorPage />,
        children: [
            { index: true, element: <ManagerOverview /> },
            { path: 'clubs', element: <MyClubs /> },
            { path: 'members', element: <ClubMembers /> },
            { path: 'events', element: <EventsManagement /> },
            { path: 'registrations', element: <EventRegistrations /> },
        ],
    },
    {
        path: '/dashboard/member',
        element: (
            <PrivateRoute requiredRole="member">
                <DashboardLayout />
            </PrivateRoute>
        ),
        errorElement: <ErrorPage />,
        children: [
            { index: true, element: <MemberOverview /> },
            { path: 'clubs', element: <MyClubsMember /> },
            { path: 'events', element: <MyEvents /> },
            { path: 'payments', element: <PaymentHistory /> },
        ],
    },
]);

export default router;

import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import { FaUsers, FaBuilding, FaDollarSign, FaCalendar } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminOverview = () => {
    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ['adminStats'],
        queryFn: async () => {
            const response = await api.get('/api/admin/stats/overview');
            return response.data;
        },
    });

    const { data: chartData } = useQuery({
        queryKey: ['membershipsChart'],
        queryFn: async () => {
            const response = await api.get('/api/admin/stats/memberships-per-club');
            return response.data;
        },
    });

    const stats = statsData?.stats || {};
    const chartDataFormatted = chartData?.data || [];

    if (statsLoading) {
        return (
            <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="stat bg-base-200 rounded-lg shadow">
                    <div className="stat-figure text-primary">
                        <FaUsers className="text-4xl" />
                    </div>
                    <div className="stat-title">Total Users</div>
                    <div className="stat-value text-primary">{stats.totalUsers || 0}</div>
                </div>

                <div className="stat bg-base-200 rounded-lg shadow">
                    <div className="stat-figure text-secondary">
                        <FaBuilding className="text-4xl" />
                    </div>
                    <div className="stat-title">Total Clubs</div>
                    <div className="stat-value text-secondary">{stats.totalClubs || 0}</div>
                    <div className="stat-desc">
                        {stats.pendingClubs || 0} pending approval
                    </div>
                </div>

                <div className="stat bg-base-200 rounded-lg shadow">
                    <div className="stat-figure text-accent">
                        <FaCalendar className="text-4xl" />
                    </div>
                    <div className="stat-title">Total Events</div>
                    <div className="stat-value text-accent">{stats.totalEvents || 0}</div>
                </div>

                <div className="stat bg-base-200 rounded-lg shadow">
                    <div className="stat-figure text-success">
                        <FaDollarSign className="text-4xl" />
                    </div>
                    <div className="stat-title">Total Revenue</div>
                    <div className="stat-value text-success">${stats.totalRevenue?.toFixed(2) || '0.00'}</div>
                    <div className="stat-desc">{stats.totalPayments || 0} transactions</div>
                </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="card bg-base-200 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Club Status</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Approved:</span>
                                <span className="font-semibold">{stats.approvedClubs || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Pending:</span>
                                <span className="font-semibold text-warning">{stats.pendingClubs || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Rejected:</span>
                                <span className="font-semibold text-error">{stats.rejectedClubs || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card bg-base-200 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title">Platform Overview</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Total Memberships:</span>
                                <span className="font-semibold">{stats.totalMemberships || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Active Events:</span>
                                <span className="font-semibold">{stats.totalEvents || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Total Payments:</span>
                                <span className="font-semibold">{stats.totalPayments || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart */}
            {chartDataFormatted.length > 0 && (
                <div className="card bg-base-200 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title mb-4">Memberships per Club (Top 10)</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartDataFormatted}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="clubName" angle={-45} textAnchor="end" height={100} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="memberCount" fill="#8884d8" name="Members" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOverview;

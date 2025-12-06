import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';

const ViewPayments = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['allPayments'],
        queryFn: async () => {
            const response = await api.get('/api/payments/all');
            return response.data;
        },
    });

    const payments = data?.payments || [];

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">View Payments</h1>

            <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                    <div className="overflow-x-auto">
                        <table className="table table-zebra">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Amount</th>
                                    <th>Type</th>
                                    <th>Club/Event</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((payment) => (
                                    <tr key={payment._id}>
                                        <td>{payment.userEmail}</td>
                                        <td className="font-semibold">${payment.amount.toFixed(2)}</td>
                                        <td>
                                            <span className={`badge ${payment.type === 'membership' ? 'badge-primary' : 'badge-secondary'
                                                }`}>
                                                {payment.type}
                                            </span>
                                        </td>
                                        <td>
                                            {payment.type === 'membership' ? payment.club?.clubName : payment.event?.title}
                                        </td>
                                        <td>
                                            <span className={`badge ${payment.status === 'completed' ? 'badge-success' : 'badge-warning'
                                                }`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewPayments;

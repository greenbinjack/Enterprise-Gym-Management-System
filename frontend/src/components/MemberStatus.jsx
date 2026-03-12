import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function MemberStatus() {
    const [userStatus, setUserStatus] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMemberStatus();
        const interval = setInterval(fetchMemberStatus, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchMemberStatus = async () => {
        try {
            setLoading(true);
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            
            if (!user) {
                setError('User not found');
                return;
            }

            // Fetch user current status
            const userRes = await api.get(`/api/users/${user.id}`);
            setUserStatus(userRes.data?.currentStatus || 'INACTIVE');

            // Fetch active subscription using the existing status endpoint
            const subRes = await api.get(`/api/subscriptions/status/${user.id}`);
            const activeSub = subRes.data?.find(sub => sub.status === 'ACTIVE');
            setSubscription(activeSub || null);
            setError('');
        } catch (err) {
            console.error('Failed to fetch member status', err);
            setError(err.response?.data?.error || 'Failed to load status');
            setUserStatus('UNKNOWN');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeColor = (status) => {
        switch(status?.toUpperCase()) {
            case 'ACTIVE':
                return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
            case 'INACTIVE':
                return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
            case 'SUSPENDED':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
        }
    };

    if (loading && !userStatus) {
        return (
            <div className="p-4 bg-white dark:bg-darkCard rounded-lg shadow">
                <div className="animate-pulse flex space-x-4">
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 bg-white dark:bg-darkCard rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 dark:text-cream">Membership Status</h3>
            
            {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                {/* Current Status */}
                <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Status</label>
                    <div className="mt-2 flex items-center space-x-2">
                        <div className={`px-4 py-2 rounded-full border-2 font-semibold text-sm ${getStatusBadgeColor(userStatus)}`}>
                            {userStatus || 'UNKNOWN'}
                        </div>
                        {userStatus === 'ACTIVE' && (
                            <span className="text-green-600 dark:text-green-400 text-sm">✓ Your subscription is active</span>
                        )}
                    </div>
                </div>

                {/* Subscription Details */}
                {subscription && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Subscription Details</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <label className="text-gray-600 dark:text-gray-400">Plan</label>
                                <p className="font-medium dark:text-cream">{subscription.planName || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-gray-600 dark:text-gray-400">Category</label>
                                <p className="font-medium dark:text-cream">{subscription.category || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-gray-600 dark:text-gray-400">Status</label>
                                <p className="font-medium dark:text-cream">{subscription.status || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-gray-600 dark:text-gray-400">End Date</label>
                                <p className="font-medium dark:text-cream">
                                    {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {!subscription && userStatus !== 'ACTIVE' && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            No active subscription. <a href="/plans" className="text-blue-500 dark:text-blue-400 hover:underline">Browse plans</a>
                        </p>
                    </div>
                )}

                {/* Info Box */}
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                    <p>Your membership status is automatically synchronized when your payment is processed. It reflects your current subscription state.</p>
                </div>
            </div>
        </div>
    );
}

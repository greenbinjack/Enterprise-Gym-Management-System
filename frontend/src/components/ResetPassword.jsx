import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // NEW STATE
    const [status, setStatus] = useState({ type: '', text: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // If there's no token in the URL, don't even show the form
    if (!token) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow border text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Invalid Link</h2>
                    <p className="text-gray-600">No reset token provided. Please request a new password reset link.</p>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: '', text: '' });

        // NEW LOGIC: Check if passwords match before sending to backend
        if (newPassword !== confirmPassword) {
            setStatus({ type: 'error', text: 'Passwords do not match. Please try again.' });
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await api.post('/api/auth/reset-password', {
                token: token,
                newPassword: newPassword
            });
            setStatus({ type: 'success', text: response.data.message });
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            setStatus({ type: 'error', text: error.response?.data?.error || 'Failed to reset password.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-10 shadow sm:rounded-lg border border-gray-200">
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Create New Password</h2>

                    {status.type === 'success' && (
                        <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6 text-sm border border-green-200 font-medium">
                            {status.text} Redirecting to login...
                        </div>
                    )}
                    {status.type === 'error' && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6 text-sm border border-red-200 font-medium">
                            {status.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <input
                                type="password"
                                placeholder="Enter your new password"
                                minLength="6"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                            <input
                                type="password"
                                placeholder="Confirm your new password"
                                minLength="6"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${confirmPassword && newPassword !== confirmPassword
                                    ? 'border-red-300 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-blue-500'
                                    }`}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting || status.type === 'success'}
                            className={`w-full flex justify-center py-3 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white transition-colors ${isSubmitting || status.type === 'success'
                                ? 'bg-blue-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            {isSubmitting ? 'Updating...' : 'Reset Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
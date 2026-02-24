import { useState } from 'react';
import axios from 'axios';
import BackButton from './BackButton';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ type: '', text: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: '', text: '' });

        try {
            const response = await axios.post('http://localhost:8080/api/auth/forgot-password', { email });
            setStatus({ type: 'success', text: response.data.message });
            setEmail('');
        } catch (error) {
            setStatus({ type: 'error', text: 'An error occurred. Please try again later.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <BackButton />
                <div className="bg-white py-8 px-10 shadow sm:rounded-lg border border-gray-200">
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Reset Password</h2>
                    <p className="text-sm text-gray-600 mb-6">Enter your email address and we'll send you a link to reset your password.</p>

                    {status.type === 'success' && <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6 text-sm border border-green-200">{status.text}</div>}
                    {status.type === 'error' && <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6 text-sm border border-red-200">{status.text}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full flex justify-center py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
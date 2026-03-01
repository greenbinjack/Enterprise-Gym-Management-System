import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function TrainerActivation() {
    const [formData, setFormData] = useState({ email: '', newPassword: '' });
    const [status, setStatus] = useState({ type: '', text: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/api/trainer/activate', formData);
            setStatus({ type: 'success', text: response.data.message });
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setStatus({ type: 'error', text: err.response?.data?.error || 'Activation failed.' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-10 shadow rounded-xl border border-gray-200">
                    <h2 className="text-center text-2xl font-extrabold text-gray-900 mb-6">Activate Trainer Account</h2>

                    {status.type === 'error' && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{status.text}</div>}
                    {status.type === 'success' && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm font-bold">{status.text} Redirecting...</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="email" placeholder="Your Email Address" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                        <input type="password" placeholder="Create New Password" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" onChange={e => setFormData({ ...formData, newPassword: e.target.value })} required />
                        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors">Activate Account</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
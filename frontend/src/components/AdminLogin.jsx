import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function AdminLogin() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // Hitting the strictly protected admin endpoint
            const response = await api.post('/api/auth/admin-login', formData);
            localStorage.setItem('user', JSON.stringify(response.data));
            localStorage.setItem('token', 'simulated-jwt-token-for-now');
            localStorage.setItem('userRole', response.data.role);
            localStorage.setItem('userId', response.data.id);
            navigate('/admin/dashboard'); // Redirect directly to the dashboard
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid credentials');
        }
    };

    const inputClass = "w-full px-4 py-3 mb-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500";

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-900 px-4">
            <div className="w-full max-w-md">
                <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
                    <div className="text-center mb-8"></div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">System Admin</h2>
                    <p className="text-gray-400 text-sm mt-2">Restricted Access Portal</p>
                </div>

                {error && <div className="bg-red-900 border border-red-500 text-red-200 p-3 rounded mb-6 text-sm text-center">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <input name="email" type="email" placeholder="Admin Email" className={inputClass} onChange={handleChange} required />
                    <input name="password" type="password" placeholder="Password" className={inputClass} onChange={handleChange} required />
                    <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg mt-2">
                        Authorize Access
                    </button>
                </form>
            </div>
        </div>
    );
}
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BackButton from './BackButton';

export default function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/auth/login', formData);
            localStorage.setItem('user', JSON.stringify(response.data));

            if (response.data.role === 'TRAINER') {
                navigate('/trainer');
            } else {
                navigate('/member/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid credentials');
        }
    };

    const inputClass = "w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
            <div className="w-full max-w-md">
                <BackButton />
                <div className="bg-white p-8 rounded-xl shadow-md">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h2>
                    {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <input name="email" type="email" placeholder="Email" className={inputClass} onChange={handleChange} required />
                        <input name="password" type="password" placeholder="Password" className={inputClass} onChange={handleChange} required />
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Login</button>
                    </form>

                    <div className="flex justify-between items-center mb-4">
                        <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">Forgot your password?</Link>
                    </div>

                    <div className="text-center mt-6 text-sm">
                        <Link to="/register" className="text-blue-600 hover:underline">Need an account? Register</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
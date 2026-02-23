import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import BackButton from './BackButton';

export default function Register() {
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/auth/register', formData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    const inputClass = "w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
            <div className="w-full max-w-md">
                <BackButton />
                <div className="bg-white p-8 rounded-xl shadow-md">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Register</h2>
                    {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <input name="firstName" placeholder="First Name" className={inputClass} onChange={handleChange} required />
                        <input name="lastName" placeholder="Last Name" className={inputClass} onChange={handleChange} required />
                        <input name="email" type="email" placeholder="Email" className={inputClass} onChange={handleChange} required />
                        <input name="password" type="password" placeholder="Password" className={inputClass} onChange={handleChange} required />
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Sign Up</button>
                    </form>

                    <div className="text-center mt-6 text-sm">
                        <Link to="/login" className="text-blue-600 hover:underline">Already have an account? Login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
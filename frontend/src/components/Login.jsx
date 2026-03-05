import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const response = await api.post('/api/auth/login', formData);
            localStorage.setItem('user', JSON.stringify(response.data));
            localStorage.setItem('token', 'simulated-jwt-token-for-now');
            localStorage.setItem('userRole', response.data.role);
            localStorage.setItem('userId', response.data.id);

            const role = response.data.role;
            if (role === 'ADMIN') navigate('/admin/dashboard');
            else if (role === 'TRAINER') navigate('/trainer/dashboard');
            else if (role === 'STAFF') navigate('/staff/dashboard');
            else navigate('/member/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = `w-full px-5 py-4 mb-5 rounded-2xl border-2 transition-all outline-none font-medium
        bg-gray-50/50 border-gray-200 text-gray-900 focus:bg-white focus:border-olive focus:ring-4 focus:ring-olive/10 
        dark:bg-darkBg/50 dark:border-gray-800 dark:text-cream dark:focus:bg-darkCard dark:focus:border-lightSage dark:focus:ring-lightSage/10`;

    return (
        <div className="flex justify-center items-center min-h-screen bg-cream dark:bg-darkBg transition-colors px-4 pt-32 pb-12 relative overflow-hidden">
            {/* Background decorative blobs */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-olive/10 dark:bg-lightSage/5 rounded-full filter blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-brown/10 dark:bg-olive/10 rounded-full filter blur-[100px] pointer-events-none animate-pulse"></div>

            <div className="w-full max-w-lg relative z-10">
                {/* Header Controls Removed */}

                {/* Login Card */}
                <div className="bg-white/90 dark:bg-darkCard/90 backdrop-blur-xl p-10 md:p-14 rounded-[2.5rem] shadow-2xl transition-colors border border-gray-100 dark:border-gray-800">
                    <div className="text-center mb-10">
                        <div className="inline-flex py-1.5 px-4 rounded-full bg-white/80 dark:bg-darkCard/80 backdrop-blur-sm text-olive dark:text-lightSage text-sm font-bold border border-olive/20 dark:border-lightSage/20 mb-6 shadow-sm tracking-widest uppercase">
                            Welcome Back
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 dark:text-cream tracking-tighter mb-4">Sign into Vortex</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg">Enter your credentials to access your dashboard.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 p-5 rounded-2xl mb-8 flex items-center gap-3 font-bold shadow-inner text-sm animate-pulse">
                            <span className="text-xl">⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="mb-8">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-400 mb-2 uppercase tracking-wider">Email Address</label>
                            <input
                                name="email"
                                type="email"
                                placeholder="john@example.com"
                                className={inputClass}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-400 mb-2 uppercase tracking-wider">Password</label>
                            <input
                                name="password"
                                type="password"
                                placeholder="Enter your password"
                                className={inputClass}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="flex justify-between items-center mb-8">
                            <label className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 cursor-pointer group">
                                <input type="checkbox" className="mr-3 w-5 h-5 rounded border-2 text-olive focus:ring-olive bg-gray-50 dark:bg-darkBg border-gray-300 dark:border-gray-700 transition-colors cursor-pointer group-hover:border-olive dark:group-hover:border-lightSage" />
                                Remember me
                            </label>
                            <Link to="/forgot-password" className="text-sm font-bold text-olive dark:text-lightSage hover:underline transition-all underline-offset-4 decoration-2">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full font-black py-5 px-6 rounded-2xl text-lg transition-all shadow-xl flex justify-center items-center gap-3 transform hover:-translate-y-1
                                ${isLoading
                                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-gray-900 to-black text-white hover:shadow-2xl dark:from-olive dark:to-lightSage dark:text-darkBg'
                                }`}
                        >
                            {isLoading ? (
                                <><span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white dark:border-darkBg"></span> Verifying credentials...</>
                            ) : (
                                <>Sign In <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg></>
                            )}
                        </button>
                    </form>

                    <div className="text-center text-sm border-t border-gray-100 dark:border-gray-800 pt-8">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Don't have an account? </span>
                        <Link to="/register" className="font-bold text-olive dark:text-lightSage hover:underline transition-all underline-offset-4 decoration-2">
                            Register now
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
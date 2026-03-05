import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function Register() {
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');
        try {
            await api.post('/api/auth/register', formData);
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
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
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-olive/10 dark:bg-lightSage/5 rounded-full filter blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brown/10 dark:bg-olive/10 rounded-full filter blur-[100px] pointer-events-none animate-pulse"></div>

            <div className="w-full max-w-lg relative z-10">
                {/* Header Controls Removed */}

                <div className="bg-white/90 dark:bg-darkCard/90 backdrop-blur-xl p-10 md:p-14 rounded-[2.5rem] shadow-2xl transition-colors border border-gray-100 dark:border-gray-800">
                    <div className="text-center mb-10">
                        <div className="inline-flex py-1.5 px-4 rounded-full bg-white/80 dark:bg-darkCard/80 backdrop-blur-sm text-olive dark:text-lightSage text-sm font-bold border border-olive/20 dark:border-lightSage/20 mb-6 shadow-sm tracking-widest uppercase">
                            Begin Today
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 dark:text-cream tracking-tighter mb-4">Create your Account</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg">Your transformation starts right here.</p>
                    </div>

                    {error && <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 p-5 rounded-2xl mb-8 flex items-center gap-3 font-bold shadow-inner text-sm animate-pulse"><span className="text-xl">⚠️</span> {error}</div>}
                    {success && <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-400 p-5 rounded-2xl mb-8 flex items-center gap-3 font-bold shadow-inner text-sm"><span className="text-xl">🎉</span> {success}</div>}

                    <form onSubmit={handleSubmit} className="mb-8">
                        <div className="grid grid-cols-2 gap-x-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-400 mb-2 uppercase tracking-wider">First Name</label>
                                <input name="firstName" type="text" placeholder="John" className={inputClass} onChange={handleChange} required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-400 mb-2 uppercase tracking-wider">Last Name</label>
                                <input name="lastName" type="text" placeholder="Smith" className={inputClass} onChange={handleChange} required />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-400 mb-2 uppercase tracking-wider">Email Address</label>
                            <input name="email" type="email" placeholder="john@example.com" className={inputClass} onChange={handleChange} required />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-400 mb-2 uppercase tracking-wider">Password</label>
                            <input name="password" type="password" placeholder="Min. 8 characters" className={inputClass} onChange={handleChange} required minLength={8} />
                        </div>

                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-8 leading-relaxed">
                            By registering, you agree to our <a href="#" className="text-olive dark:text-lightSage hover:underline">Terms of Service</a> and <a href="#" className="text-olive dark:text-lightSage hover:underline">Privacy Policy</a>.
                        </p>

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
                                <><span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white dark:border-darkBg"></span> Setting up account...</>
                            ) : (
                                <>Create Account <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg></>
                            )}
                        </button>
                    </form>

                    <div className="text-center text-sm border-t border-gray-100 dark:border-gray-800 pt-8">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">Already have an account? </span>
                        <Link to="/login" className="font-bold text-olive dark:text-lightSage hover:underline transition-all underline-offset-4 decoration-2">
                            Sign in to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
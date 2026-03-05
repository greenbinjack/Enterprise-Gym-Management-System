import { useState } from 'react';
import api from '../api/axiosConfig';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ type: '', text: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: '', text: '' });

        try {
            const response = await api.post('/api/auth/forgot-password', { email });
            setStatus({ type: 'success', text: response.data.message });
            setEmail('');
        } catch (error) {
            setStatus({ type: 'error', text: 'An error occurred. Please try again later.' });
        } finally {
            setIsSubmitting(false);
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
                <div className="bg-white/90 dark:bg-darkCard/90 backdrop-blur-xl p-10 md:p-14 rounded-[2.5rem] shadow-2xl transition-colors border border-gray-100 dark:border-gray-800">
                    <div className="text-center mb-10">
                        <div className="inline-flex py-1.5 px-4 rounded-full bg-white/80 dark:bg-darkCard/80 backdrop-blur-sm text-olive dark:text-lightSage text-sm font-bold border border-olive/20 dark:border-lightSage/20 mb-6 shadow-sm tracking-widest uppercase">
                            Account Recovery
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 dark:text-cream tracking-tighter mb-4">Reset Password</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg">Enter your email address and we'll send you a link to reset your password.</p>
                    </div>

                    {status.type === 'success' && <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-400 p-5 rounded-2xl mb-8 font-bold flex items-center gap-3 shadow-inner text-sm"><span className="text-xl">🎉</span> {status.text}</div>}
                    {status.type === 'error' && <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 p-5 rounded-2xl mb-8 font-bold flex items-center gap-3 shadow-inner text-sm animate-pulse"><span className="text-xl">⚠️</span> {status.text}</div>}

                    <form onSubmit={handleSubmit} className="mb-0">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-400 mb-2 uppercase tracking-wider">Email Address</label>
                            <input
                                type="email"
                                placeholder="john@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={inputClass}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full mt-4 font-black py-5 px-6 rounded-2xl text-lg transition-all shadow-xl flex justify-center items-center gap-3 transform hover:-translate-y-1
                                ${isSubmitting
                                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-gray-900 to-black text-white hover:shadow-2xl dark:from-olive dark:to-lightSage dark:text-darkBg'
                                }`}
                        >
                            {isSubmitting ? (
                                <><span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white dark:border-darkBg"></span> Sending Link...</>
                            ) : (
                                <>Send Reset Link <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg></>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
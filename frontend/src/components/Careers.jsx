import { useState } from 'react';
import api from '../api/axiosConfig';
import { Link } from 'react-router-dom';

export default function Careers() {
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: '', specialties: '', cvUrl: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await api.post('/api/recruitment/apply', formData);
            setStatus({ type: 'success', message: response.data.message });
            setFormData({ firstName: '', lastName: '', email: '', phone: '', specialties: '', cvUrl: '' });
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.error || 'Failed to submit application.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass = `w-full px-5 py-4 mb-6 rounded-2xl border-2 transition-all outline-none font-medium
        bg-gray-50/50 border-gray-200 text-gray-900 focus:bg-white focus:border-olive focus:ring-4 focus:ring-olive/10 
        dark:bg-darkBg/50 dark:border-gray-800 dark:text-cream dark:focus:bg-darkCard dark:focus:border-lightSage dark:focus:ring-lightSage/10`;

    return (
        <div className="min-h-screen bg-cream dark:bg-darkBg transition-colors pt-32 pb-12 px-4 sm:px-6 lg:px-12 relative overflow-hidden flex flex-col justify-center">
            {/* Background decorative blobs */}
            <div className="absolute top-20 right-0 w-96 h-96 bg-olive/10 dark:bg-lightSage/5 rounded-full filter blur-[100px] pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-10 left-0 w-[500px] h-[500px] bg-brown/5 dark:bg-olive/5 rounded-full filter blur-[120px] pointer-events-none"></div>

            <div className="max-w-4xl mx-auto w-full relative z-10">

                {/* Header Controls Removed */}

                <div className="text-center mb-12">
                    <div className="inline-flex py-1.5 px-4 rounded-full bg-white/80 dark:bg-darkCard/80 backdrop-blur-sm text-olive dark:text-lightSage text-sm font-bold border border-olive/20 dark:border-lightSage/20 mb-8 shadow-sm tracking-widest uppercase">
                        Hiring Top Talent
                    </div>
                    <h2 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-cream tracking-tighter mb-6">Join Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-olive to-brown dark:from-lightSage dark:to-cream">Elite Team.</span></h2>
                    <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed font-medium">
                        We're searching for passionate, uncompromising fitness professionals to elevate the Vortex experience.
                    </p>
                </div>

                <div className="bg-white/90 dark:bg-darkCard/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl transition-colors border border-gray-100 dark:border-gray-800 p-8 md:p-14 mb-10">

                    {status.type === 'success' && (
                        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-400 p-6 rounded-2xl mb-10 font-bold flex items-center gap-3 shadow-inner">
                            <span className="text-2xl">🎉</span> {status.message}
                        </div>
                    )}
                    {status.type === 'error' && (
                        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 p-6 rounded-2xl mb-10 font-bold flex items-center gap-3 shadow-inner">
                            <span className="text-2xl">⚠️</span> {status.message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-2 mb-8 border-b border-gray-100 dark:border-gray-800 pb-8">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-cream">Personal Information</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Tell us about yourself and how we can reach you.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">First Name *</label>
                                <input name="firstName" placeholder="John" value={formData.firstName} onChange={handleChange} className={inputClass} required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Last Name *</label>
                                <input name="lastName" placeholder="Smith" value={formData.lastName} onChange={handleChange} className={inputClass} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Email Address *</label>
                                <input name="email" type="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} className={inputClass} required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Phone Number *</label>
                                <input name="phone" placeholder="e.g. 01700000000" value={formData.phone} onChange={handleChange} className={inputClass} required />
                            </div>
                        </div>

                        <div className="space-y-2 mb-8 mt-4 border-b border-gray-100 dark:border-gray-800 pb-8">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-cream">Professional Experience</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Highlight your expertise and qualifications.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Areas of Expertise *</label>
                            <input name="specialties" placeholder="e.g. HIIT, Olympic Weightlifting, Registered Dietician" value={formData.specialties} onChange={handleChange} className={inputClass} required />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Digital Resume / CV Link *</label>
                            <input name="cvUrl" type="url" placeholder="Paste a Google Drive, LinkedIn, or personal portfolio URL" value={formData.cvUrl} onChange={handleChange} className={`${inputClass} mb-0`} required />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full mt-10 flex justify-center py-5 rounded-2xl shadow-xl font-black text-lg transition-all items-center gap-3 transform hover:-translate-y-1
                                ${isSubmitting
                                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-gray-900 to-black text-white hover:shadow-2xl dark:from-olive dark:to-lightSage dark:text-darkBg'
                                }`}
                        >
                            {isSubmitting ? (
                                <><span className="animate-spin rounded-full h-6 w-6 border-b-2 border-white dark:border-darkBg"></span> Processing Application...</>
                            ) : (
                                <>Submit Application <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg></>
                            )}
                        </button>
                    </form>
                </div>

                <div className="text-center">
                    <span className="text-gray-500 dark:text-gray-500 font-medium">Return to the  </span>
                    <Link to="/" className="text-olive dark:text-lightSage hover:underline font-bold transition-all underline-offset-4 decoration-2">
                        Vortex Homepage
                    </Link>
                </div>
            </div>
        </div>
    );
}
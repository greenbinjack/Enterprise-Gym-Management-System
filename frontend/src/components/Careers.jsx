import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import BackButton from './BackButton';

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
            const response = await axios.post('http://localhost:8080/api/recruitment/apply', formData);
            setStatus({ type: 'success', message: response.data.message });
            setFormData({ firstName: '', lastName: '', email: '', phone: '', specialties: '', cvUrl: '' }); // Clear form
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.error || 'Failed to submit application.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass = "w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none";

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <BackButton /> {/* ADD THE BACK BUTTON HERE */}
                <h2 className="text-center text-3xl font-extrabold text-gray-900">Join Our Elite Team</h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Apply to become a trainer at Enterprise Gym.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {status.type === 'success' && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">{status.message}</div>}
                    {status.type === 'error' && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">{status.message}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-4">
                            <input name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} className={inputClass} required />
                            <input name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} className={inputClass} required />
                        </div>
                        <input name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} className={inputClass} required />
                        <input name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className={inputClass} required />
                        <input name="specialties" placeholder="Specialties (e.g., HIIT, Weightlifting, Yoga)" value={formData.specialties} onChange={handleChange} className={inputClass} required />
                        <input name="cvUrl" type="url" placeholder="Link to CV (Google Drive, LinkedIn, etc.)" value={formData.cvUrl} onChange={handleChange} className={inputClass} required />

                        <button type="submit" disabled={isSubmitting} className={`w-full flex justify-center py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                            {isSubmitting ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </form>
                    <div className="mt-6 text-center">
                        <Link to="/" className="text-blue-600 hover:text-blue-500 text-sm">Return to Home</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
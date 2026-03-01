import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function TrainerProfile() {
    const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '', phone: '', address: '' });
    const [photoPreview, setPhotoPreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

    const currentUser = JSON.parse(localStorage.getItem('user'));
    const userId = currentUser ? currentUser.id : null;

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get(`/api/trainer/${userId}/profile`);
                setProfile({
                    firstName: res.data.firstName || '',
                    lastName: res.data.lastName || '',
                    email: res.data.email || currentUser?.email || '',
                    phone: res.data.phone || '',
                    address: res.data.address || ''
                });
                if (res.data.photoUrl) {
                    setPhotoPreview(res.data.photoUrl);
                }
            } catch (error) {
                console.error("Failed to fetch trainer profile", error);
            }
        };
        if (userId) fetchProfile();
    }, [userId, currentUser?.email]);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPhotoPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setStatusMessage({ type: 'loading', text: 'Saving profile...' });

        // FormData for submitting mixed content
        const formData = new FormData();
        formData.append('firstName', profile.firstName);
        formData.append('lastName', profile.lastName);
        formData.append('phone', profile.phone);
        formData.append('address', profile.address);
        if (selectedFile) {
            formData.append('photo', selectedFile);
        }

        try {
            const res = await api.put(`/api/trainer/${currentUser.id}/profile`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setStatusMessage({ type: 'success', text: res.data.message });

            // Update local storage
            const updatedUser = { ...currentUser, firstName: profile.firstName };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            // Dispatch event to update sidebar
            window.dispatchEvent(new Event('storage'));

        } catch (error) {
            setStatusMessage({ type: 'error', text: error.response?.data?.error || 'Failed to update profile. Please try again.' });
            console.error(error);
        }
    };

    const inputClass = "w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors " +
        "bg-white border-gray-300 text-gray-900 focus:ring-olive " +
        "dark:bg-darkBg dark:border-gray-700 dark:text-cream dark:focus:ring-lightSage";

    return (
        <div className="p-6 md:p-10 max-w-4xl mx-auto h-full overflow-y-auto">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-cream tracking-tight">
                    Profile <span className="text-olive dark:text-lightSage">Settings</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Update your personal information and identification photo.</p>
            </div>

            {statusMessage.text && (
                <div className={`mb-6 p-4 rounded-xl font-bold text-sm shadow-sm ${statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:border-green-800/50 dark:text-green-400' :
                        statusMessage.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400' :
                            'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/50 dark:text-blue-400'
                    }`}>
                    {statusMessage.type === 'loading' && <span className="inline-block animate-spin mr-2">↻</span>}
                    {statusMessage.text}
                </div>
            )}

            <form onSubmit={handleSave} className="bg-white dark:bg-darkCard border border-gray-100 dark:border-gray-800 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-none overflow-hidden h-fit transition-transform hover:-translate-y-1 duration-300">
                {/* Photo Section */}
                <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center gap-8 bg-gray-50/50 dark:bg-darkBg/50">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-3xl border-4 border-white dark:border-darkBg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center shadow-xl">
                            {photoPreview ? (
                                <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-5xl text-gray-400 dark:text-gray-600">👤</span>
                            )}
                        </div>
                        <label className="absolute -bottom-3 -right-3 bg-olive text-white dark:bg-lightSage dark:text-darkBg w-12 h-12 flex items-center justify-center rounded-2xl cursor-pointer shadow-lg hover:scale-105 transition-transform border-4 border-white dark:border-darkCard">
                            <span className="text-xl">📷</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                        </label>
                    </div>
                    <div className="text-center sm:text-left">
                        <h3 className="text-gray-900 dark:text-cream font-bold text-xl mb-1">Official ID Photo</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs">Upload a clear face photo. This will be used for facility access control.</p>
                    </div>
                </div>

                {/* Fields */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                        <input type="text" value={profile.firstName} onChange={e => setProfile({ ...profile, firstName: e.target.value })} className={inputClass} required />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                        <input type="text" value={profile.lastName} onChange={e => setProfile({ ...profile, lastName: e.target.value })} className={inputClass} required />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex justify-between items-center">
                            <span>Email Address <span className="text-gray-400 font-normal ml-2">(Read-Only)</span></span>
                        </label>
                        <input type="email" value={profile.email} readOnly className={`${inputClass} bg-gray-50 dark:bg-black/20 text-gray-500 cursor-not-allowed`} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Phone Number *</label>
                        <input type="tel" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} className={inputClass} placeholder="e.g. 01700000000" required />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Residential Address *</label>
                        <textarea value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} className={inputClass} rows="3" required />
                    </div>
                </div>

                <div className="p-6 md:p-8 bg-gray-50/50 dark:bg-darkBg/50 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                    <button
                        type="submit"
                        disabled={statusMessage.type === 'loading'}
                        className={`font-bold py-3 px-10 rounded-xl shadow-lg transition-all w-full md:w-auto flex items-center justify-center gap-2
                            ${statusMessage.type === 'loading'
                                ? 'bg-gray-400 dark:bg-gray-700 text-white cursor-not-allowed'
                                : 'bg-olive hover:bg-olive/90 text-white dark:bg-lightSage dark:text-darkBg dark:hover:bg-lightSage/90 hover:scale-[1.02]'
                            }`}
                    >
                        {statusMessage.type === 'loading' ? 'Saving...' : '💾 Save Profile Data'}
                    </button>
                </div>
            </form>
        </div>
    );
}

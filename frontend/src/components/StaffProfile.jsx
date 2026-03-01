import { useState, useEffect } from 'react';
import axios from 'axios';

export default function StaffProfile() {
    const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '', phone: '', address: '' });
    const [photoPreview, setPhotoPreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

    const currentUser = JSON.parse(localStorage.getItem('user'));
    const userId = currentUser?.id;

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/api/staff/profile/${userId}`);
                setProfile({
                    firstName: res.data.firstName || '',
                    lastName: res.data.lastName || '',
                    email: res.data.email || currentUser?.email || '',
                    phone: res.data.phone || '',
                    address: res.data.address || ''
                });
                if (res.data.photoUrl) setPhotoPreview(res.data.photoUrl);
            } catch (error) {
                console.error('Failed to fetch staff profile', error);
            }
        };
        if (userId) fetchProfile();
    }, [userId]);

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

        const formData = new FormData();
        formData.append('firstName', profile.firstName);
        formData.append('lastName', profile.lastName);
        formData.append('phone', profile.phone);
        formData.append('address', profile.address);
        if (selectedFile) formData.append('photo', selectedFile);

        try {
            const res = await axios.put(`http://localhost:8080/api/staff/profile/${userId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setStatusMessage({ type: 'success', text: res.data.message });
            const updatedUser = { ...currentUser, firstName: profile.firstName };
            localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (error) {
            setStatusMessage({ type: 'error', text: error.response?.data?.error || 'Failed to update profile.' });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-white">
                    Profile <span className="text-green-400">Settings</span>
                </h1>
                <p className="text-slate-400 mt-1">Update your personal information and photo.</p>
            </div>

            {statusMessage.text && (
                <div className={`mb-6 p-4 rounded-xl font-bold text-sm ${statusMessage.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        statusMessage.type === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                    {statusMessage.text}
                </div>
            )}

            <form onSubmit={handleSave} className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden max-w-3xl">
                {/* Photo Section */}
                <div className="p-8 border-b border-slate-700 flex flex-col sm:flex-row items-center gap-8">
                    <div className="relative group">
                        <div className="w-28 h-28 rounded-full border-4 border-slate-700 overflow-hidden bg-slate-700 flex items-center justify-center">
                            {photoPreview ? (
                                <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl">👤</span>
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-green-700 transition-colors">
                            📷
                            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                        </label>
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-xl">Profile Photo</h3>
                        <p className="text-slate-400 text-sm mt-1">Upload a clear face photo for facility identification.</p>
                    </div>
                </div>

                {/* Fields */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-1">First Name</label>
                        <input
                            type="text" value={profile.firstName}
                            onChange={e => setProfile({ ...profile, firstName: e.target.value })}
                            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-1">Last Name</label>
                        <input
                            type="text" value={profile.lastName}
                            onChange={e => setProfile({ ...profile, lastName: e.target.value })}
                            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                            required
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-300 mb-1">Email Address (Read-Only)</label>
                        <input
                            type="email" value={profile.email} readOnly
                            className="w-full p-3 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-500 cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-1">Phone Number *</label>
                        <input
                            type="tel" value={profile.phone}
                            onChange={e => setProfile({ ...profile, phone: e.target.value })}
                            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                            placeholder="e.g. 01700000000" required
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-300 mb-1">Home Address *</label>
                        <textarea
                            value={profile.address}
                            onChange={e => setProfile({ ...profile, address: e.target.value })}
                            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                            rows="3" required
                        />
                    </div>
                </div>

                <div className="p-6 bg-slate-900/30 border-t border-slate-700 flex justify-end">
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-10 rounded-xl shadow-lg transition-all">
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}

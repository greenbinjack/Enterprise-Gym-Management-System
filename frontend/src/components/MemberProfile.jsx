import { useState, useEffect } from 'react';
import axios from 'axios';

export default function MemberProfile() {
    const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '', phone: '', address: '' });
    const [photoPreview, setPhotoPreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

    // Get the logged-in user's ID
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const userId = currentUser ? currentUser.id : null;

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/api/member/profile/${userId}`);
                setProfile({
                    firstName: res.data.firstName,
                    lastName: res.data.lastName,
                    email: res.data.email,
                    phone: res.data.phone,
                    address: res.data.address
                });
                if (res.data.photoUrl) {
                    setPhotoPreview(res.data.photoUrl);
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
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

        // 🚨 CRITICAL: We MUST use FormData to send files and text together!
        const formData = new FormData();
        formData.append('firstName', profile.firstName);
        formData.append('lastName', profile.lastName);
        formData.append('phone', profile.phone);
        formData.append('address', profile.address);
        if (selectedFile) {
            formData.append('photo', selectedFile);
        }

        try {
            const res = await axios.put(`http://localhost:8080/api/member/profile/${currentUser.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setStatusMessage({ type: 'success', text: res.data.message });

            // Update local storage just in case the firstName changed
            const updatedUser = { ...currentUser, firstName: profile.firstName };
            localStorage.setItem('user', JSON.stringify(updatedUser));

        } catch (error) {
            setStatusMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
            console.error(error);
        }
    };

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Profile Settings</h2>

            {statusMessage.text && (
                <div className={`mb-6 p-4 rounded-lg font-bold ${statusMessage.type === 'success' ? 'bg-green-100 text-green-800' : statusMessage.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                    {statusMessage.text}
                </div>
            )}

            <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8">
                    {/* PHOTO UPLOAD UI */}
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full border-4 border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center">
                            {photoPreview ? (
                                <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl text-gray-300">👤</span>
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition-colors">
                            📷
                            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                        </label>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Profile Photo</h3>
                        <p className="text-sm text-gray-500">A clear face photo is required for facility entry verification.</p>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="block text-sm font-bold text-gray-700">First Name</label><input type="text" value={profile.firstName} onChange={e => setProfile({ ...profile, firstName: e.target.value })} className="mt-1 w-full p-3 border rounded-lg bg-gray-50" required /></div>
                    <div><label className="block text-sm font-bold text-gray-700">Last Name</label><input type="text" value={profile.lastName} onChange={e => setProfile({ ...profile, lastName: e.target.value })} className="mt-1 w-full p-3 border rounded-lg bg-gray-50" required /></div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700">Email Address (Read-Only)</label>
                        <input type="email" value={profile.email} readOnly className="mt-1 w-full p-3 border rounded-lg bg-gray-200 text-gray-500 cursor-not-allowed" />
                    </div>

                    <div><label className="block text-sm font-bold text-gray-700">Phone Number *</label><input type="tel" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g. 01700000000" required /></div>
                    <div className="md:col-span-2"><label className="block text-sm font-bold text-gray-700">Residential Address *</label><textarea value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" rows="3" required></textarea></div>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-colors">
                        Save Profile Data
                    </button>
                </div>
            </form>
        </div>
    );
}
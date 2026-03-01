import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminManageStaff() {
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createdCredentials, setCreatedCredentials] = useState(null);
    const [staffList, setStaffList] = useState([]);

    const fetchStaff = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/staff/directory?search=');
            setStaffList((res.data || []).filter(u => u.role === 'STAFF'));
        } catch (err) {
            console.error('Failed to fetch staff list', err);
        }
    };

    useEffect(() => { fetchStaff(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatusMessage({ type: '', text: '' });
        setCreatedCredentials(null);

        try {
            const res = await axios.post('http://localhost:8080/api/admin/staff/create', form);
            setStatusMessage({ type: 'success', text: res.data.message });
            setCreatedCredentials({ email: form.email, tempPassword: res.data.tempPassword });
            setForm({ firstName: '', lastName: '', email: '', phone: '' });
            fetchStaff();
        } catch (error) {
            setStatusMessage({
                type: 'error',
                text: error.response?.data?.error || 'Failed to create staff member.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900">
                    Manage <span className="text-green-600">Staff</span>
                </h1>
                <p className="text-gray-500 mt-1">Create new staff accounts. They'll receive a welcome email with their temporary password.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Create Form */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                        <h2 className="font-bold text-gray-800 text-lg">➕ Create New Staff Account</h2>
                    </div>
                    <form onSubmit={handleCreate} className="p-6 space-y-4">
                        {statusMessage.text && (
                            <div className={`p-4 rounded-xl text-sm font-bold ${statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                {statusMessage.text}
                            </div>
                        )}

                        {createdCredentials && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <p className="text-blue-800 font-bold text-sm mb-2">🔑 Temporary Credentials (share securely):</p>
                                <p className="text-blue-700 text-sm">Email: <strong>{createdCredentials.email}</strong></p>
                                <p className="text-blue-700 text-sm">Password: <strong>{createdCredentials.tempPassword}</strong></p>
                                <p className="text-blue-600 text-xs mt-2">An email has also been sent to the staff member.</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">First Name</label>
                                <input
                                    type="text" value={form.firstName} required
                                    onChange={e => setForm({ ...form, firstName: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="John"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Last Name</label>
                                <input
                                    type="text" value={form.lastName} required
                                    onChange={e => setForm({ ...form, lastName: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Smith"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email" value={form.email} required
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="staff@gym.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Phone</label>
                            <input
                                type="tel" value={form.phone}
                                onChange={e => setForm({ ...form, phone: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="01700000000"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <><span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span> Creating...</>
                            ) : (
                                <><span>✉️</span> Create Account & Send Email</>
                            )}
                        </button>
                    </form>
                </div>

                {/* Current Staff List */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                        <h2 className="font-bold text-gray-800 text-lg">👥 Current Staff ({staffList.length})</h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {staffList.length === 0 ? (
                            <div className="text-center py-12">
                                <span className="text-4xl">👤</span>
                                <p className="text-gray-400 mt-3">No staff members yet</p>
                            </div>
                        ) : (
                            staffList.map(staff => (
                                <div key={staff.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-black text-sm overflow-hidden">
                                        {staff.photoUrl ? (
                                            <img src={staff.photoUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            staff.firstName?.[0] || 'S'
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800">{staff.firstName} {staff.lastName}</p>
                                        <p className="text-gray-500 text-sm">{staff.email || 'No email on record'}</p>
                                    </div>
                                    <span className="ml-auto bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase">Staff</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

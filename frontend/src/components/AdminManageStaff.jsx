import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function AdminManageStaff() {
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createdCredentials, setCreatedCredentials] = useState(null);
    const [staffList, setStaffList] = useState([]);
    const [isLoadingStaff, setIsLoadingStaff] = useState(true);

    const fetchStaff = async () => {
        try {
            const res = await api.get('/api/staff/directory?search=');
            setStaffList((res.data || []).filter(u => u.role === 'STAFF'));
        } catch (err) {
            console.error('Failed to fetch staff list', err);
        } finally {
            setIsLoadingStaff(false);
        }
    };

    useEffect(() => { fetchStaff(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatusMessage({ type: '', text: '' });
        setCreatedCredentials(null);

        try {
            const res = await api.post('/api/admin/staff/create', form);
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

    const inputClass = "w-full p-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors " +
        "bg-white border-gray-300 text-gray-900 focus:ring-olive " +
        "dark:bg-darkBg dark:border-gray-700 dark:text-cream dark:focus:ring-lightSage";

    return (
        <div className="p-6 md:p-10 max-w-6xl mx-auto h-full overflow-y-auto">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-cream tracking-tight">
                    Manage <span className="text-olive dark:text-lightSage">Staff</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Create new staff accounts. They'll receive a welcome email with their temporary password.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Create Form */}
                <div className="bg-white dark:bg-darkCard border border-gray-100 dark:border-gray-800 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-none overflow-hidden h-fit">
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-darkBg/50 flex items-center justify-between">
                        <h2 className="font-bold text-gray-900 dark:text-cream text-lg tracking-tight">Create Account</h2>
                        <span className="text-2xl">➕</span>
                    </div>

                    <form onSubmit={handleCreate} className="p-6 md:p-8 space-y-5">
                        {statusMessage.text && (
                            <div className={`p-4 rounded-xl text-sm font-bold ${statusMessage.type === 'success'
                                    ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:border-green-800/50 dark:text-green-400'
                                    : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400'
                                }`}>
                                {statusMessage.type === 'success' ? '✅ ' : '⚠️ '} {statusMessage.text}
                            </div>
                        )}

                        {createdCredentials && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-5 mb-6">
                                <p className="text-blue-800 dark:text-blue-300 font-bold text-sm mb-3 uppercase tracking-wider">🔑 Keep Securely:</p>
                                <div className="space-y-1 bg-white/60 dark:bg-black/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/50 font-mono text-sm">
                                    <p className="text-blue-900 dark:text-blue-200">Email: <span className="font-bold">{createdCredentials.email}</span></p>
                                    <p className="text-blue-900 dark:text-blue-200">Pass:  <span className="font-bold bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded">{createdCredentials.tempPassword}</span></p>
                                </div>
                                <p className="text-blue-600 dark:text-blue-400 text-xs mt-3 font-medium">An email has been dispatched asynchronously to the staff member.</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                                <input type="text" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className={inputClass} placeholder="John" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                                <input type="text" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className={inputClass} placeholder="Smith" required />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="staff@enterprise.gym" required />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                            <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inputClass} placeholder="01700000000" />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-4 shadow-lg
                                ${isSubmitting
                                    ? 'bg-gray-400 dark:bg-gray-700 text-white cursor-not-allowed'
                                    : 'bg-olive hover:bg-olive/90 text-white dark:bg-lightSage dark:text-darkBg dark:hover:bg-lightSage/90'
                                }`}
                        >
                            {isSubmitting ? (
                                <><span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white dark:border-darkBg"></span> Processing...</>
                            ) : (
                                <><span>✉️</span> Create Account & Alert Staff</>
                            )}
                        </button>
                    </form>
                </div>

                {/* Current Staff List */}
                <div className="bg-white dark:bg-darkCard border border-gray-100 dark:border-gray-800 rounded-3xl shadow-lg shadow-gray-200/50 dark:shadow-none overflow-hidden h-fit max-h-[700px] flex flex-col">
                    <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-darkBg/50 flex items-center justify-between sticky top-0 z-10">
                        <h2 className="font-bold text-gray-900 dark:text-cream text-lg tracking-tight">Current Staff Registry</h2>
                        <span className="bg-olive/10 text-olive dark:bg-lightSage/20 dark:text-lightSage font-black text-xs px-3 py-1 rounded-full">
                            {staffList.length} Active
                        </span>
                    </div>

                    <div className="overflow-y-auto flex-1 divide-y divide-gray-100 dark:divide-gray-800/50 custom-scrollbar">
                        {isLoadingStaff ? (
                            <div className="flex justify-center py-16">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olive dark:border-lightSage"></div>
                            </div>
                        ) : staffList.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="inline-block p-4 rounded-full bg-gray-50 dark:bg-darkBg mb-3 text-3xl">👤</div>
                                <p className="text-gray-500 dark:text-gray-400 font-bold mb-1">No staff online</p>
                                <p className="text-sm text-gray-400 dark:text-gray-500">Add someone using the form to the left to get started.</p>
                            </div>
                        ) : (
                            staffList.map(staff => (
                                <div key={staff.id} className="flex items-center gap-4 px-6 py-5 hover:bg-gray-50 dark:hover:bg-darkBg/50 transition-colors">
                                    <div className="w-12 h-12 rounded-full bg-olive/10 dark:bg-lightSage/10 flex items-center justify-center text-olive dark:text-lightSage font-black text-xl overflow-hidden border border-olive/20 dark:border-lightSage/20 shadow-sm flex-shrink-0">
                                        {staff.photoUrl ? (
                                            <img src={staff.photoUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            staff.firstName?.[0] || 'S'
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-gray-900 dark:text-cream truncate">{staff.firstName} {staff.lastName}</p>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm truncate">{staff.email || 'No email on record'}</p>
                                    </div>
                                    <span className="hidden sm:inline-block flex-shrink-0 bg-olive/10 text-olive dark:bg-lightSage/10 dark:text-lightSage text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-olive/20 dark:border-lightSage/20">
                                        Staff
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

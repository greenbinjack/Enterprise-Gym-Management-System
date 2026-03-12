import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function AdminRecruitmentBoard() {
    const [board, setBoard] = useState({ needsReview: [], hired: [], rejected: [], fired: [] });
    const [isLoading, setIsLoading] = useState(true);

    // Rate state per trainer
    const [trainerRates, setTrainerRates] = useState({}); // { id: hourlyRate }
    const [editingRate, setEditingRate] = useState(null);  // trainerId being edited
    const [newRate, setNewRate] = useState('');
    const [savingRate, setSavingRate] = useState(false);
    const [rateStatus, setRateStatus] = useState({ trainerId: null, type: '', text: '' });

    const fetchBoard = async () => {
        try {
            const response = await api.get('/api/recruitment/board');
            setBoard(response.data);
        } catch (error) {
            console.error("Failed to load recruitment board", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRates = async () => {
        try {
            const res = await api.get('/api/admin/trainers');
            const map = {};
            (res.data || []).forEach(t => { map[t.id] = t.hourlyRate ?? 0; });
            setTrainerRates(map);
        } catch (err) {
            console.error('Failed to fetch trainer rates', err);
        }
    };

    useEffect(() => {
        fetchBoard();
        fetchRates();
    }, []);

    const handleApplicationAction = async (id, action) => {
        try {
            await api.post(`/api/recruitment/applications/${id}/${action}`);
            fetchBoard();
        } catch (error) { alert("Failed to move application."); }
    };

    const handleToggleTrainerAccess = async (userId, makeActive) => {
        const msg = makeActive ? "Restore this trainer's access and rehire them?" : "Fire this trainer and revoke system access immediately?";
        if (!window.confirm(msg)) return;
        try {
            await api.put(`/api/admin/users/${userId}/toggle-status`, { isActive: makeActive });
            fetchBoard();
        } catch (error) { alert("Failed to change trainer status."); }
    };

    const handleSaveRate = async (trainerId) => {
        setSavingRate(true);
        try {
            await api.patch(`/api/admin/trainers/${trainerId}/hourly-rate`, {
                hourlyRate: parseFloat(newRate) || 0
            });
            setTrainerRates(prev => ({ ...prev, [trainerId]: parseFloat(newRate) || 0 }));
            setRateStatus({ trainerId, type: 'success', text: 'Saved.' });
            setEditingRate(null);
            setNewRate('');
            setTimeout(() => setRateStatus({ trainerId: null, type: '', text: '' }), 3000);
        } catch (err) {
            setRateStatus({ trainerId, type: 'error', text: 'Failed.' });
        } finally {
            setSavingRate(false);
        }
    };

    if (isLoading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

    return (
        <div className="p-8 min-h-screen bg-gray-50 dark:bg-darkBg overflow-x-auto">
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-cream">Trainer Recruitment Board</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Manage applications, active staff, and terminated contracts.</p>
            </div>

            <div className="flex gap-6 min-w-max pb-8">

                {/* 1. Needs Review */}
                <div className="w-80 bg-gray-100 dark:bg-darkCard rounded-xl border border-gray-200 dark:border-gray-700 p-4 h-fit">
                    <h3 className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-sm mb-4">📝 Needs Review ({board.needsReview.length})</h3>
                    {board.needsReview.map(app => (
                        <div key={app.id} className="bg-white dark:bg-darkBg p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-3 border-l-4 border-l-yellow-400">
                            <h4 className="font-bold text-gray-900 dark:text-cream">{app.firstName} {app.lastName}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{app.email}</p>
                            <a href={app.cvUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:underline mb-2 block">📄 View CV</a>
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-darkCard p-2 rounded mb-3">{app.specialties}</p>
                            <div className="flex space-x-2">
                                <button onClick={() => handleApplicationAction(app.id, 'approve')} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 rounded">Hire</button>
                                <button onClick={() => handleApplicationAction(app.id, 'reject')} className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-bold py-2 rounded">Reject</button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 2. Active Staff — includes inline hourly rate editor */}
                <div className="w-80 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-900 p-4 h-fit">
                    <h3 className="font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wider text-sm mb-4">✅ Active Staff ({board.hired.length})</h3>
                    {board.hired.map(user => {
                        const isEditing = editingRate === user.id;
                        const currentRate = trainerRates[user.id] ?? 0;
                        const thisStatus = rateStatus.trainerId === user.id ? rateStatus : null;
                        return (
                            <div key={user.id} className="bg-white dark:bg-darkCard p-4 rounded-lg shadow-sm border border-blue-200 dark:border-blue-900 mb-3 border-l-4 border-l-blue-500">
                                <h4 className="font-bold text-gray-900 dark:text-cream">{user.firstName} {user.lastName}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{user.email}</p>

                                {/* Hourly Rate */}
                                <div className="mb-3">
                                    {isEditing ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1.5">
                                                <div className="relative flex-1">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">৳</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={newRate}
                                                        onChange={e => setNewRate(e.target.value)}
                                                        placeholder="0.00"
                                                        className="pl-5 pr-2 py-1.5 w-full text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-darkBg text-gray-900 dark:text-cream focus:outline-none focus:ring-1 focus:ring-blue-400"
                                                        autoFocus
                                                    />
                                                </div>
                                                <span className="text-gray-400 text-xs">/hr</span>
                                            </div>
                                            <div className="flex gap-1.5">
                                                <button
                                                    onClick={() => handleSaveRate(user.id)}
                                                    disabled={savingRate}
                                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 rounded disabled:opacity-60"
                                                >
                                                    {savingRate ? '...' : 'Save Rate'}
                                                </button>
                                                <button
                                                    onClick={() => { setEditingRate(null); setNewRate(''); }}
                                                    className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-2 font-medium"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">Rate:</span>
                                                <span className="text-xs font-black text-gray-900 dark:text-white bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-lg">
                                                    ৳{Number(currentRate).toLocaleString()}/hr
                                                </span>
                                                {thisStatus && (
                                                    <span className={`text-[10px] font-bold ${thisStatus.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                                                        {thisStatus.text}
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => { setEditingRate(user.id); setNewRate(currentRate); }}
                                                className="text-[10px] font-black text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                ✏️ Edit
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <button onClick={() => handleToggleTrainerAccess(user.id, false)} className="w-full bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-bold py-2 rounded">
                                    🔥 Fire Trainer
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* 3. Rejected Applications */}
                <div className="w-80 bg-gray-100 dark:bg-darkCard rounded-xl border border-gray-200 dark:border-gray-700 p-4 h-fit">
                    <h3 className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-sm mb-4">❌ Rejected ({board.rejected.length})</h3>
                    {board.rejected.map(app => (
                        <div key={app.id} className="bg-white dark:bg-darkBg p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-3 opacity-75">
                            <h4 className="font-bold text-gray-700 dark:text-gray-300">{app.firstName} {app.lastName}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{app.email}</p>
                            <button onClick={() => handleApplicationAction(app.id, 'pending')} className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-bold py-2 rounded">
                                ⏪ Move to Review
                            </button>
                        </div>
                    ))}
                </div>

                {/* 4. Fired Trainers */}
                <div className="w-80 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-900 p-4 h-fit">
                    <h3 className="font-bold text-red-800 dark:text-red-400 uppercase tracking-wider text-sm mb-4">🚫 Fired Trainers ({board.fired.length})</h3>
                    {board.fired.map(user => (
                        <div key={user.id} className="bg-white dark:bg-darkCard p-4 rounded-lg shadow-sm border border-red-200 dark:border-red-900 mb-3 border-l-4 border-l-red-500">
                            <h4 className="font-bold text-gray-900 dark:text-cream line-through">{user.firstName} {user.lastName}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Access Revoked</p>
                            <button onClick={() => handleToggleTrainerAccess(user.id, true)} className="w-full bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 text-xs font-bold py-2 rounded">
                                🤝 Rehire Trainer
                            </button>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
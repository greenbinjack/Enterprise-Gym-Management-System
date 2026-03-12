import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const STATUS_CONFIG = {
    AVAILABLE: {
        label: 'Available',
        color: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
        dot: 'bg-green-500',
        btn: 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/30',
    },
    NEEDS_MAINTENANCE: {
        label: 'Needs Maintenance',
        color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
        dot: 'bg-amber-500',
        btn: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-900/30',
    },
    RETIRED: {
        label: 'Retired',
        color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
        dot: 'bg-red-500',
        btn: 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30',
    },
};

export default function AdminInventory() {
    const [equipment, setEquipment] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [feedback, setFeedback] = useState({ id: null, message: '' });
    const [showAddForm, setShowAddForm] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', category: 'Cardio' });
    const [isAdding, setIsAdding] = useState(false);
    const [addError, setAddError] = useState('');

    const fetchInventory = async () => {
        try {
            const response = await api.get('/api/equipment');
            setEquipment(response.data || []);
        } catch (err) {
            console.error('Failed to fetch equipment:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchInventory(); }, []);

    const updateStatus = async (id, newStatus) => {
        try {
            await api.put(`/api/equipment/${id}/status`, { status: newStatus });
            setEquipment(prev =>
                prev.map(eq => eq.id === id ? { ...eq, status: newStatus } : eq)
            );
            setFeedback({ id, message: `Updated to ${newStatus.replace('_', ' ')}` });
            setTimeout(() => setFeedback({ id: null, message: '' }), 3000);
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const handleAddEquipment = async (e) => {
        e.preventDefault();
        if (!newItem.name.trim()) return;
        setIsAdding(true);
        setAddError('');
        try {
            await api.post('/api/equipment', newItem);
            setNewItem({ name: '', category: 'Cardio' });
            setShowAddForm(false);
            fetchInventory();
        } catch (err) {
            setAddError(err.response?.data?.error || 'Failed to add equipment.');
        } finally {
            setIsAdding(false);
        }
    };

    const grouped = {
        AVAILABLE: equipment.filter(e => e.status === 'AVAILABLE'),
        NEEDS_MAINTENANCE: equipment.filter(e => e.status === 'NEEDS_MAINTENANCE'),
        RETIRED: equipment.filter(e => e.status === 'RETIRED'),
    };

    return (
        <div className="p-8 bg-gray-50 dark:bg-darkBg min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-cream">Master Equipment Inventory</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and update the status of all gym equipment.</p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
                >
                    {showAddForm ? '✕ Cancel' : '＋ Add Equipment'}
                </button>
            </div>

            {/* Add Equipment Form */}
            {showAddForm && (
                <form onSubmit={handleAddEquipment} className="bg-white dark:bg-darkCard rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 mb-8 flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Equipment Name</label>
                        <input
                            type="text"
                            value={newItem.name}
                            onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                            placeholder="e.g. Treadmill X200"
                            className="w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-darkBg text-gray-900 dark:text-cream"
                            required
                        />
                    </div>
                    <div className="sm:w-48">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                        <select
                            value={newItem.category}
                            onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                            className="w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-darkBg text-gray-900 dark:text-cream"
                        >
                            <option value="Cardio">Cardio</option>
                            <option value="Strength">Strength</option>
                            <option value="Flexibility">Flexibility</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <button type="submit" disabled={isAdding} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-colors">
                        {isAdding ? 'Adding...' : 'Save'}
                    </button>
                    {addError && <p className="text-red-600 dark:text-red-400 text-sm font-medium">{addError}</p>}
                </form>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <div key={key} className={`rounded-xl border p-5 text-center ${cfg.color}`}>
                        <p className="text-4xl font-black mb-1">{grouped[key]?.length ?? 0}</p>
                        <p className="text-xs font-bold uppercase tracking-widest">{cfg.label}</p>
                    </div>
                ))}
            </div>

            {/* Equipment List */}
            {isLoading ? (
                <div className="flex justify-center py-24">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
                </div>
            ) : equipment.length === 0 ? (
                <div className="text-center py-24 bg-white dark:bg-darkCard rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <span className="text-5xl block mb-4">🏋️</span>
                    <p className="text-gray-900 dark:text-cream text-xl font-black mb-1">No equipment found</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Click "Add Equipment" to start building your inventory.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-darkCard rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-darkBg text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4">Machine Name</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                            {equipment.map(item => {
                                const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.AVAILABLE;
                                return (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-darkBg transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{item.category === 'Cardio' ? '🏃' : '💪'}</span>
                                                <span className="font-bold text-gray-900 dark:text-cream">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-medium text-sm">{item.category}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${cfg.color}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                                                {cfg.label}
                                            </span>
                                            {feedback.id === item.id && (
                                                <span className="ml-2 text-green-600 text-xs font-bold animate-pulse">✓ {feedback.message}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2 justify-end flex-wrap">
                                                {item.status === 'AVAILABLE' && (
                                                    <button
                                                        onClick={() => updateStatus(item.id, 'NEEDS_MAINTENANCE')}
                                                        className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-all ${STATUS_CONFIG.NEEDS_MAINTENANCE.btn}`}
                                                    >
                                                        🔧 Flag
                                                    </button>
                                                )}
                                                {item.status === 'NEEDS_MAINTENANCE' && (
                                                    <button
                                                        onClick={() => updateStatus(item.id, 'AVAILABLE')}
                                                        className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-all ${STATUS_CONFIG.AVAILABLE.btn}`}
                                                    >
                                                        ✅ Fix
                                                    </button>
                                                )}
                                                {item.status !== 'RETIRED' && (
                                                    <button
                                                        onClick={() => updateStatus(item.id, 'RETIRED')}
                                                        className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-all ${STATUS_CONFIG.RETIRED.btn}`}
                                                    >
                                                        🗑️ Retire
                                                    </button>
                                                )}
                                                {item.status === 'RETIRED' && (
                                                    <button
                                                        onClick={() => updateStatus(item.id, 'AVAILABLE')}
                                                        className="px-3 py-1.5 border rounded-lg text-xs font-bold transition-all bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/30"
                                                    >
                                                        ♻️ Restore
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
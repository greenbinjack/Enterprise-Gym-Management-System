import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const STATUS_CONFIG = {
    AVAILABLE: { label: 'Available', color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800', dot: 'bg-green-500', btn: 'bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 border-green-200 dark:border-green-800' },
    NEEDS_MAINTENANCE: { label: 'Needs Maintenance', color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800', dot: 'bg-amber-500', btn: 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50 border-amber-200 dark:border-amber-800' },
    RETIRED: { label: 'Retired', color: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800', dot: 'bg-red-500', btn: 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 border-red-200 dark:border-red-800' },
};

export default function EquipmentManagement() {
    const [equipment, setEquipment] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [feedback, setFeedback] = useState({ id: null, message: '' });

    const fetchEquipment = async () => {
        try {
            const res = await api.get('/api/equipment');
            setEquipment(res.data || []);
        } catch (err) {
            console.error('Failed to fetch equipment:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEquipment();
    }, []);

    const updateStatus = async (id, newStatus) => {
        try {
            await api.put(`/api/equipment/${id}/status`, { status: newStatus });
            setEquipment((prev) =>
                prev.map((eq) => (eq.id === id ? { ...eq, status: newStatus } : eq))
            );
            setFeedback({ id, message: `Status updated to ${newStatus.replace('_', ' ')}` });
            setTimeout(() => setFeedback({ id: null, message: '' }), 3000);
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const grouped = {
        AVAILABLE: equipment.filter((e) => e.status === 'AVAILABLE'),
        NEEDS_MAINTENANCE: equipment.filter((e) => e.status === 'NEEDS_MAINTENANCE'),
        RETIRED: equipment.filter((e) => e.status === 'RETIRED'),
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto h-full overflow-y-auto">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-cream tracking-tight">
                    Equipment <span className="text-olive dark:text-lightSage">Log</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Monitor and update the operational status of all gym equipment.</p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <div key={key} className={`rounded-3xl border p-6 text-center transition-transform hover:-translate-y-1 ${cfg.color}`}>
                        <p className="text-4xl font-black mb-1">{grouped[key]?.length ?? 0}</p>
                        <p className="text-xs font-bold uppercase tracking-widest">{cfg.label}</p>
                    </div>
                ))}
            </div>

            {/* Equipment List */}
            {isLoading ? (
                <div className="flex justify-center py-24">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-olive dark:border-lightSage"></div>
                </div>
            ) : equipment.length === 0 ? (
                <div className="text-center py-24 bg-white dark:bg-darkCard rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="inline-block p-6 rounded-full bg-gray-50 dark:bg-darkBg mb-4">
                        <span className="text-5xl">🏋️</span>
                    </div>
                    <p className="text-gray-900 dark:text-cream text-xl font-black tracking-tight mb-1">No equipment found</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Add inventory items to see them listed here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {equipment.map((eq) => {
                        const cfg = STATUS_CONFIG[eq.status] || STATUS_CONFIG.AVAILABLE;
                        return (
                            <div
                                key={eq.id}
                                className="bg-white dark:bg-darkCard border border-gray-100 dark:border-gray-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 hover:shadow-lg hover:border-olive/30 dark:hover:border-lightSage/30 transition-all group"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-olive/10 dark:bg-lightSage/10 flex flex-shrink-0 items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                                        {eq.category === 'Cardio' ? '🏃' : '💪'}
                                    </div>
                                    <div className="min-w-0 flex-1 pr-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-gray-900 dark:text-cream font-bold text-lg leading-tight truncate">{eq.name}</p>
                                        </div>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{eq.category}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-start sm:items-end gap-3 flex-shrink-0">
                                    {/* Current Status Badge */}
                                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest shadow-sm ${cfg.color}`}>
                                        <span className={`w-2 h-2 rounded-full ${cfg.dot}`}></span>
                                        {cfg.label}
                                    </span>

                                    {/* Feedback message */}
                                    {feedback.id === eq.id && (
                                        <span className="text-green-600 dark:text-green-400 text-xs font-bold animate-pulse">✓ {feedback.message}</span>
                                    )}

                                    {/* Action Buttons Container */}
                                    <div className="flex flex-wrap gap-2 w-full sm:w-auto mt-1 sm:mt-0">
                                        {eq.status === 'AVAILABLE' && (
                                            <button
                                                onClick={() => updateStatus(eq.id, 'NEEDS_MAINTENANCE')}
                                                className={`flex-1 sm:flex-none px-4 py-2 border rounded-xl text-xs font-bold transition-all shadow-sm ${STATUS_CONFIG.NEEDS_MAINTENANCE.btn}`}
                                            >
                                                🔧 Flag
                                            </button>
                                        )}
                                        {eq.status === 'NEEDS_MAINTENANCE' && (
                                            <button
                                                onClick={() => updateStatus(eq.id, 'AVAILABLE')}
                                                className={`flex-1 sm:flex-none px-4 py-2 border rounded-xl text-xs font-bold transition-all shadow-sm ${STATUS_CONFIG.AVAILABLE.btn}`}
                                            >
                                                ✅ Fix
                                            </button>
                                        )}
                                        {eq.status !== 'RETIRED' && (
                                            <button
                                                onClick={() => updateStatus(eq.id, 'RETIRED')}
                                                className={`flex-1 sm:flex-none px-4 py-2 border rounded-xl text-xs font-bold transition-all shadow-sm ${STATUS_CONFIG.RETIRED.btn}`}
                                            >
                                                🗑️ Retire
                                            </button>
                                        )}
                                        {eq.status === 'RETIRED' && (
                                            <button
                                                onClick={() => updateStatus(eq.id, 'AVAILABLE')}
                                                className={`flex-1 sm:flex-none px-4 py-2 border rounded-xl text-xs font-bold transition-all shadow-sm bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 border-blue-200 dark:border-blue-800`}
                                            >
                                                ♻️ Restore
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

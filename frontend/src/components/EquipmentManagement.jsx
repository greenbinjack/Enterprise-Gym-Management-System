import { useState, useEffect } from 'react';
import axios from 'axios';

const STATUS_CONFIG = {
    AVAILABLE: { label: 'Available', color: 'bg-green-500/20 text-green-400 border-green-500/30', dot: 'bg-green-400' },
    NEEDS_MAINTENANCE: { label: 'Needs Maintenance', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', dot: 'bg-amber-400' },
    RETIRED: { label: 'Retired', color: 'bg-red-500/20 text-red-400 border-red-500/30', dot: 'bg-red-400' },
};

export default function EquipmentManagement() {
    const [equipment, setEquipment] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [feedback, setFeedback] = useState({ id: null, message: '' });

    const fetchEquipment = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/equipment');
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
            await axios.put(`http://localhost:8080/api/equipment/${id}/status`, { status: newStatus });
            setEquipment((prev) =>
                prev.map((eq) => (eq.id === id ? { ...eq, status: newStatus } : eq))
            );
            setFeedback({ id, message: `Status updated to ${newStatus}` });
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-white">
                    Equipment <span className="text-green-400">Management</span>
                </h1>
                <p className="text-slate-400 mt-1">Monitor and update the status of all gym equipment.</p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <div key={key} className={`rounded-2xl border p-5 text-center ${cfg.color}`}>
                        <p className="text-3xl font-black">{grouped[key]?.length ?? 0}</p>
                        <p className="text-xs font-bold uppercase tracking-wider mt-1">{cfg.label}</p>
                    </div>
                ))}
            </div>

            {/* Equipment List */}
            {isLoading ? (
                <div className="flex justify-center py-24">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-400"></div>
                </div>
            ) : equipment.length === 0 ? (
                <div className="text-center py-24">
                    <span className="text-6xl">🏋️</span>
                    <p className="text-slate-400 font-bold mt-4">No equipment found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {equipment.map((eq) => {
                        const cfg = STATUS_CONFIG[eq.status] || STATUS_CONFIG.AVAILABLE;
                        return (
                            <div
                                key={eq.id}
                                className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-slate-600 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-xl">
                                        {eq.category === 'Cardio' ? '🏃' : '💪'}
                                    </div>
                                    <div>
                                        <p className="text-white font-bold">{eq.name}</p>
                                        <p className="text-slate-400 text-sm">{eq.category}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 flex-wrap">
                                    {/* Current Status Badge */}
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase ${cfg.color}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                                        {cfg.label}
                                    </span>

                                    {/* Feedback message */}
                                    {feedback.id === eq.id && (
                                        <span className="text-green-400 text-xs font-bold">✓ {feedback.message}</span>
                                    )}

                                    {/* Action Buttons */}
                                    {eq.status === 'AVAILABLE' && (
                                        <button
                                            onClick={() => updateStatus(eq.id, 'NEEDS_MAINTENANCE')}
                                            className="px-4 py-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold hover:bg-amber-500/30 transition-colors"
                                        >
                                            🔧 Flag for Maintenance
                                        </button>
                                    )}
                                    {eq.status === 'NEEDS_MAINTENANCE' && (
                                        <button
                                            onClick={() => updateStatus(eq.id, 'AVAILABLE')}
                                            className="px-4 py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-xs font-bold hover:bg-green-500/30 transition-colors"
                                        >
                                            ✅ Mark Available
                                        </button>
                                    )}
                                    {eq.status !== 'RETIRED' && (
                                        <button
                                            onClick={() => updateStatus(eq.id, 'RETIRED')}
                                            className="px-4 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold hover:bg-red-500/30 transition-colors"
                                        >
                                            🗑️ Retire
                                        </button>
                                    )}
                                    {eq.status === 'RETIRED' && (
                                        <button
                                            onClick={() => updateStatus(eq.id, 'AVAILABLE')}
                                            className="px-4 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-bold hover:bg-blue-500/30 transition-colors"
                                        >
                                            ♻️ Restore
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

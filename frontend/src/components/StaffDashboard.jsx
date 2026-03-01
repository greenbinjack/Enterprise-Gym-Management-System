import { useState, useEffect } from 'react';
import axios from 'axios';

export default function StaffDashboard() {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const [activeMembers, setActiveMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchActiveMembers = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/checkin/active');
            setActiveMembers(res.data || []);
            setLastUpdated(new Date().toLocaleTimeString());
        } catch (err) {
            console.error('Failed to fetch active members:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchActiveMembers();
        // Auto-refresh every 10 seconds
        const interval = setInterval(fetchActiveMembers, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-white">
                    Live <span className="text-green-400">Dashboard</span>
                </h1>
                <p className="text-slate-400 mt-1">
                    Welcome, {currentUser?.firstName}. Real-time view of gym activity.
                </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-800/60 backdrop-blur border border-slate-700 rounded-2xl p-6 text-center">
                    <p className="text-5xl font-black text-green-400">{activeMembers.length}</p>
                    <p className="text-slate-300 mt-2 font-semibold text-sm uppercase tracking-widest">Members In Gym</p>
                </div>
                <div className="bg-slate-800/60 backdrop-blur border border-slate-700 rounded-2xl p-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                        <p className="text-green-400 font-bold text-xl">LIVE</p>
                    </div>
                    <p className="text-slate-300 mt-2 font-semibold text-sm uppercase tracking-widest">Auto-Refresh</p>
                </div>
                <div className="bg-slate-800/60 backdrop-blur border border-slate-700 rounded-2xl p-6 text-center">
                    <p className="text-xl font-bold text-white">{lastUpdated || '—'}</p>
                    <p className="text-slate-300 mt-2 font-semibold text-sm uppercase tracking-widest">Last Updated</p>
                </div>
            </div>

            {/* Active Members Roster */}
            <div className="bg-slate-800/60 backdrop-blur border border-slate-700 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
                    <h2 className="text-white font-bold text-lg">Currently Inside the Gym</h2>
                    <button
                        onClick={fetchActiveMembers}
                        className="text-green-400 hover:text-green-300 text-sm font-bold transition-colors"
                    >
                        ↻ Refresh
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-400"></div>
                    </div>
                ) : activeMembers.length === 0 ? (
                    <div className="text-center py-16">
                        <span className="text-6xl">🏃</span>
                        <p className="text-slate-400 font-bold mt-4 text-lg">No members in the gym right now</p>
                        <p className="text-slate-500 text-sm mt-1">The roster will update automatically</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs text-slate-400 uppercase tracking-wider">
                                    <th className="px-6 py-3">#</th>
                                    <th className="px-6 py-3">Member Name</th>
                                    <th className="px-6 py-3">Checked In At</th>
                                    <th className="px-6 py-3">Duration</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeMembers.map((m, i) => {
                                    const checkInTime = m.checkInTime ? new Date(m.checkInTime) : null;
                                    const durationMs = checkInTime ? (new Date() - checkInTime) : 0;
                                    const durationMins = Math.floor(durationMs / 60000);
                                    return (
                                        <tr
                                            key={m.userId || i}
                                            className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                                        >
                                            <td className="px-6 py-4 text-slate-400 text-sm">{i + 1}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-black text-sm">
                                                        {(m.firstName || 'M')[0]}
                                                    </div>
                                                    <span className="text-white font-semibold">
                                                        {m.firstName} {m.lastName}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300 text-sm">
                                                {checkInTime ? checkInTime.toLocaleTimeString() : '—'}
                                            </td>
                                            <td className="px-6 py-4 text-slate-300 text-sm">
                                                {durationMins > 0 ? `${durationMins} min` : 'Just arrived'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full uppercase">
                                                    Active
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

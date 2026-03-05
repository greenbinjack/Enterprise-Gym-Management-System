import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function StaffDashboard() {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const [activeMembers, setActiveMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchActiveMembers = async () => {
        try {
            const res = await api.get('/api/checkin/active');
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
        const interval = setInterval(fetchActiveMembers, 120000); // 2 min auto-refresh
        return () => clearInterval(interval);
    }, []);

    // Helper formatting
    const getDurationMins = (checkInTime) => {
        if (!checkInTime) return 0;
        const durationMs = new Date() - new Date(checkInTime);
        return Math.floor(durationMs / 60000);
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto h-full overflow-y-auto">

            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-cream tracking-tight">
                        Live <span className="text-olive dark:text-lightSage">Dashboard</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
                        Welcome, {currentUser?.firstName}. Real-time overview of gym activity.
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-darkCard rounded-full shadow-sm border border-gray-100 dark:border-gray-800 self-start md:self-auto">
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                        <p className="text-green-600 dark:text-green-400 font-bold text-xs uppercase tracking-widest">Live Auto-Update</p>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="bg-white dark:bg-darkCard p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 transition-transform hover:-translate-y-1 relative overflow-hidden">
                    {/* Decorative blob under the stat */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-olive/5 dark:bg-lightSage/5 rounded-full filter blur-xl"></div>

                    <div className="relative z-10 flex flex-col h-full justify-center pl-4 border-l-4 border-l-olive dark:border-l-lightSage">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Members In Gym</p>
                        <p className="text-5xl font-black text-gray-900 dark:text-white">{activeMembers.length}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-darkCard p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 transition-transform hover:-translate-y-1 relative overflow-hidden">
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brown/5 dark:bg-brown/10 rounded-full filter blur-xl"></div>

                    <div className="relative z-10 flex flex-col h-full justify-center pl-4 border-l-4 border-l-brown">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Last Roster Sync</p>
                        <p className="text-2xl font-black text-gray-900 dark:text-white mt-2">{lastUpdated || 'Initialising...'}</p>
                    </div>
                </div>
            </div>

            {/* Active Members Roster */}
            <div className="bg-white dark:bg-darkCard rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-darkBg/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="font-bold text-gray-900 dark:text-cream text-lg tracking-tight">Active Floor Roster</h2>
                    <button
                        onClick={() => { setIsLoading(true); fetchActiveMembers(); }}
                        className="text-olive hover:text-olive/80 dark:text-lightSage dark:hover:text-lightSage/80 text-sm font-bold flex items-center gap-1 transition-colors bg-olive/10 dark:bg-lightSage/10 px-4 py-2 rounded-xl w-fit"
                    >
                        <span>↺</span> Force Sync
                    </button>
                </div>

                <div className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-olive dark:border-lightSage"></div>
                        </div>
                    ) : activeMembers.length === 0 ? (
                        <div className="text-center py-20 px-4">
                            <div className="inline-block p-6 rounded-full bg-gray-50 dark:bg-darkBg border border-gray-100 dark:border-gray-800 mb-4 shadow-sm">
                                <span className="text-5xl block">🏃‍♂️💨</span>
                            </div>
                            <h3 className="text-gray-900 dark:text-cream font-black text-xl mb-2 tracking-tight">An Empty Floor</h3>
                            <p className="text-gray-500 dark:text-gray-400">There are no members currently checked in to the facility.</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">The roster will update automatically every 2 minutes.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto w-full">
                            <table className="w-full text-left min-w-[600px]">
                                <thead>
                                    <tr className="bg-gray-50/50 dark:bg-darkBg/50 border-b border-gray-100 dark:border-gray-800">
                                        <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest w-16">#</th>
                                        <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Member Info</th>
                                        <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Checked In</th>
                                        <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Time In Facility</th>
                                        <th className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                                    {activeMembers.map((m, i) => {
                                        const mins = getDurationMins(m.checkInTime);
                                        return (
                                            <tr key={m.userId || i} className="hover:bg-gray-50/50 dark:hover:bg-darkBg/50 transition-colors group">
                                                <td className="px-6 py-5 text-gray-400 dark:text-gray-500 font-bold">{i + 1}</td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-olive/10 dark:bg-lightSage/10 border border-olive/20 dark:border-lightSage/20 flex flex-shrink-0 items-center justify-center text-olive dark:text-lightSage font-black text-sm group-hover:bg-olive group-hover:text-white dark:group-hover:bg-lightSage dark:group-hover:text-darkBg transition-colors shadow-sm">
                                                            {(m.firstName || '?')[0]}
                                                        </div>
                                                        <span className="text-gray-900 dark:text-white font-bold truncate">
                                                            {m.firstName} {m.lastName}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-darkBg px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800 text-sm whitespace-nowrap">
                                                        {m.checkInTime ? new Date(m.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="font-bold text-gray-900 dark:text-gray-200">
                                                        {mins > 0 ? `${mins} m` : 'Just arrived'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="inline-flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-[10px] font-black px-2.5 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
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
        </div>
    );
}

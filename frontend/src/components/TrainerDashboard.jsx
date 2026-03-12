import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

const TrainerDashboard = () => {
    const [scheduleData, setScheduleData] = useState({ sessions: [], recurringPlans: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [commissionData, setCommissionData] = useState({ total: 0, commissions: [] });
    // Modal State
    const [selectedSession, setSelectedSession] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [loadingParticipants, setLoadingParticipants] = useState(false);
    const [attendanceError, setAttendanceError] = useState('');
    
    const trainerId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Now using the centralized `api` instance which auto-injects the token
                const response = await api.get(`/api/scheduling/trainer/${trainerId}/dashboard`);
                setScheduleData(response.data);
            } catch (err) {
                console.error("Failed to fetch trainer dashboard:", err);
                setError("Failed to load your schedule.");
            } finally {
                setLoading(false);
            }
        };

        const fetchCommissions = async () => {
            try {
                const res = await api.get(`/api/scheduling/trainer/${trainerId}/commissions`);
                setCommissionData(res.data);
            } catch (err) {
                console.error('Failed to load commissions', err);
            }
        };

        if (trainerId) {
            fetchDashboardData();
            fetchCommissions();
        }
    }, [trainerId]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[500px] w-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-olive dark:border-lightSage"></div>
        </div>
    );

    if (error) return (
        <div className="p-8 mt-10 max-w-2xl mx-auto bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold text-center rounded-2xl border border-red-200 dark:border-red-800 shadow-sm">
            {error}
        </div>
    );

    // Helper: Generate calendar days for the current week
    const today = new Date();
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }); // Monday start

    // Get Today's specific sessions
    const todaysSessions = scheduleData.sessions.filter(session =>
        isSameDay(new Date(session.startTime), today)
    );

    const handleSessionClick = async (session) => {
        setSelectedSession(session);
        setLoadingParticipants(true);
        setAttendanceError('');
        try {
            const res = await api.get(`/api/scheduling/trainer/${trainerId}/classes/${session.id}/participants`);
            setParticipants(res.data);
        } catch (err) {
            setAttendanceError("Failed to load participants.");
        } finally {
            setLoadingParticipants(false);
        }
    };

    const handleMarkAttendance = async (memberId, status) => {
        try {
            setAttendanceError('');
            await api.post(`/api/scheduling/trainer/${trainerId}/classes/${selectedSession.id}/attendance`, {
                memberId,
                status
            });
            setParticipants(prev => prev.map(p => p.id === memberId ? { ...p, status } : p));
        } catch (err) {
            setAttendanceError(err.response?.data?.error || "Failed to mark attendance.");
        }
    };

    const closeSessionModal = () => {
        setSelectedSession(null);
        setParticipants([]);
        setAttendanceError('');
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto h-full overflow-y-auto w-full">
            {/* Dashboard Header */}
            <div className="mb-8 relative">
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-cream tracking-tight">Your Dashboard</h1>
                <p className="mt-2 text-gray-500 dark:text-gray-400 font-medium tracking-wide">Welcome back. Here is your operational overview.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Left Column: Today's Overview */}
                <div className="xl:col-span-1 space-y-6">
                    <section className="bg-white dark:bg-darkCard rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden h-fit transition-transform hover:-translate-y-1">
                        <div className="bg-gray-50/80 dark:bg-darkBg/80 px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-cream flex items-center gap-2">
                                    <span className="text-olive dark:text-lightSage">📍</span> Today's Roster
                                </h2>
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mt-1">{format(today, 'EEEE, MMMM do')}</p>
                            </div>
                            <span className="bg-olive/10 dark:bg-lightSage/10 text-olive dark:text-lightSage font-black text-xl px-3 py-1 rounded-xl border border-olive/20 dark:border-lightSage/20 shadow-sm">
                                {todaysSessions.length}
                            </span>
                        </div>

                        <div className="p-0">
                            {todaysSessions.length === 0 ? (
                                <div className="text-center py-10 px-6">
                                    <div className="inline-block p-4 rounded-full bg-gray-50 dark:bg-darkBg mb-3 text-2xl">☕</div>
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">No sessions scheduled for today.</p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {todaysSessions.map(session => (
                                        <li key={session.id} onClick={() => handleSessionClick(session)} className="p-6 hover:bg-gray-50 dark:hover:bg-darkBg/50 transition-colors relative overflow-hidden group cursor-pointer">
                                            {/* Accent line */}
                                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-olive dark:bg-lightSage opacity-50 group-hover:opacity-100 transition-opacity"></div>

                                            <h3 className="font-bold text-gray-900 dark:text-cream text-lg leading-tight mb-2 pr-4">{session.name}</h3>

                                            <div className="space-y-1.5">
                                                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium flex items-center gap-2">
                                                    <svg className="w-4 h-4 opacity-70 border border-gray-300 dark:border-gray-600 rounded-full flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                    {format(new Date(session.startTime), 'h:mm a')} - {format(new Date(session.endTime), 'h:mm a')}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium flex items-center gap-2">
                                                    <svg className="w-4 h-4 opacity-70 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                                    {session.room?.name || 'Assigned Room'}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium flex items-center gap-2 mt-2 border-t border-gray-100 dark:border-gray-800 pt-2">
                                                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-0.5 rounded border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                                                        {session.bookedCount || 0} / {session.maxCapacity} Booked
                                                    </span>
                                                    <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-0.5 rounded border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
                                                        {session.attendedCount || 0} Attended
                                                    </span>
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </section>

                    {/* Commission Earnings Card */}
                    <section className="bg-white dark:bg-darkCard rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-transform hover:-translate-y-1">
                        <div className="bg-gray-50/80 dark:bg-darkBg/80 px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-cream flex items-center gap-2">
                                <span className="text-brown">💵</span> Your Earnings
                            </h2>
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mt-1">Session commissions</p>
                        </div>
                        <div className="p-6">
                            <p className="text-3xl font-black text-gray-900 dark:text-cream mb-1">
                                ${Number(commissionData.total || 0).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-4">
                                Total across {commissionData.commissions?.length || 0} tracked session(s)
                            </p>
                            {commissionData.commissions?.length > 0 && (
                                <ul className="space-y-2 max-h-40 overflow-y-auto">
                                    {commissionData.commissions.slice(0, 5).map(c => (
                                        <li key={c.id} className="flex justify-between items-center text-xs py-1.5 border-b border-gray-50 dark:border-gray-800 last:border-0">
                                            <span className="text-gray-600 dark:text-gray-400 font-medium">{c.hoursWorked}h @ ${c.ratePerHour}/hr</span>
                                            <span className="font-black text-olive dark:text-lightSage">${Number(c.commissionAmount).toFixed(2)}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </section>
                </div>

                {/* Right Column: Weekly Overview (Infinite Recurring Plans) */}
                <div className="xl:col-span-2">
                    <section className="bg-white dark:bg-darkCard rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden text-left h-full">
                        <div className="bg-gray-50/80 dark:bg-darkBg/80 px-6 sm:px-8 py-6 border-b border-gray-100 dark:border-gray-800">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-cream flex items-center gap-2">
                                <span className="text-brown">🗓️</span> Assigned Recurring Plans
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">These are your ongoing weekly categorical responsibilities.</p>
                        </div>

                        <div className="p-0 overflow-x-auto w-full">
                            <table className="w-full min-w-[600px] text-left">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-800">
                                        <th className="px-6 py-4 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-8">Class Plan</th>
                                        <th className="px-6 py-4 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Schedule Engine</th>
                                        <th className="px-6 py-4 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-tight">Category</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                                    {scheduleData.recurringPlans.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-16 text-center">
                                                <div className="inline-block p-4 rounded-full bg-gray-50 dark:bg-darkBg mb-3 text-3xl opacity-50">📂</div>
                                                <p className="text-gray-900 dark:text-cream font-bold text-lg">No recurring plans assigned.</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">You do not currently lead any automated class schedules.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        scheduleData.recurringPlans.map(plan => (
                                            <tr key={plan.id} className="hover:bg-gray-50 dark:hover:bg-darkBg/50 transition-colors group">
                                                <td className="px-6 py-5 pl-8">
                                                    <div className="font-bold text-gray-900 dark:text-cream text-base mb-1 pr-4">{plan.name}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium max-w-[200px] lg:max-w-xs truncate" title={plan.description}>{plan.description}</div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col gap-2">
                                                        <span className="inline-flex items-center w-fit px-2.5 py-1 rounded border shadow-sm text-[10px] font-black uppercase tracking-widest bg-brown/10 text-brown border-brown/20 dark:bg-brown/20 dark:border-brown/30">
                                                            {plan.recurringDayOfWeek}s
                                                        </span>
                                                        <div className="flex items-center text-sm font-bold text-gray-700 dark:text-gray-300">
                                                            <svg className="w-4 h-4 mr-1.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                            {plan.recurringStartTime} <span className="text-gray-400 dark:text-gray-500 text-xs font-medium ml-2">({plan.durationMinutes}m)</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="inline-flex items-center bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm whitespace-nowrap">
                                                        {plan.category === 'HIIT' ? '🔥 ' : plan.category === 'Yoga' ? '🧘 ' : '💪 '}{plan.category}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

            </div>

            {/* Session Details Modal */}
            {selectedSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-white dark:bg-darkCard rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-darkBg">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-cream">
                                {selectedSession.name} <span className="text-sm font-medium text-gray-500 ml-2">Class Roster</span>
                            </h3>
                            <button onClick={closeSessionModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                ✖
                            </button>
                        </div>
                        
                        <div className="p-6 flex-1 overflow-y-auto">
                            {attendanceError && (
                                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm border border-red-200">
                                    {attendanceError}
                                </div>
                            )}

                            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-lg text-sm border border-blue-100 dark:border-blue-800/30 font-medium flex items-center gap-2">
                                ℹ️ You can only mark attendance while the class is actively ongoing.
                            </div>

                            {loadingParticipants ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-olive flex-shrink-0"></div>
                                </div>
                            ) : participants.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    No participants booked for this session yet.
                                </div>
                            ) : (
                                <ul className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                                    {participants.map(p => {
                                        const now = new Date();
                                        const startTime = new Date(selectedSession.startTime);
                                        const endTime = new Date(selectedSession.endTime);
                                        const isOngoing = now >= startTime && now <= endTime;
                                        
                                        return (
                                            <li key={p.id} className="p-4 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center bg-white dark:bg-darkCard">
                                                <div className="flex items-center gap-3">
                                                    {p.photoUrl ? (
                                                        <img src={p.photoUrl} alt="profile" className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold border border-gray-200 dark:border-gray-700">
                                                            {p.firstName[0]}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-cream">{p.firstName} {p.lastName}</p>
                                                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">{p.status}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => handleMarkAttendance(p.id, 'PRESENT')}
                                                        disabled={!isOngoing || p.status === 'PRESENT'}
                                                        className={`px-4 py-1.5 text-xs font-bold rounded-lg border shadow-sm transition-colors ${p.status === 'PRESENT' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' : 'bg-white text-gray-700 border-gray-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200 dark:bg-darkBg dark:text-gray-300 dark:border-gray-700 dark:hover:bg-green-900/20'} disabled:opacity-50 disabled:cursor-not-allowed`}
                                                    >
                                                        Present
                                                    </button>
                                                    <button 
                                                        onClick={() => handleMarkAttendance(p.id, 'ABSENT')}
                                                        disabled={!isOngoing || p.status === 'ABSENT'}
                                                        className={`px-4 py-1.5 text-xs font-bold rounded-lg border shadow-sm transition-colors ${p.status === 'ABSENT' ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' : 'bg-white text-gray-700 border-gray-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 dark:bg-darkBg dark:text-gray-300 dark:border-gray-700 dark:hover:bg-red-900/20'} disabled:opacity-50 disabled:cursor-not-allowed`}
                                                    >
                                                        Absent
                                                    </button>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrainerDashboard;
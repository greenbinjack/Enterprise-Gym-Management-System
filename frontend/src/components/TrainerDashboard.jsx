import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, parse, startOfWeek, addDays, isSameDay } from 'date-fns';

const TrainerDashboard = () => {
    const [scheduleData, setScheduleData] = useState({ sessions: [], recurringPlans: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const trainerId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:8080/api/scheduling/trainer/${trainerId}/dashboard`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setScheduleData(response.data);
            } catch (err) {
                console.error("Failed to fetch trainer dashboard:", err);
                setError("Failed to load your schedule.");
            } finally {
                setLoading(false);
            }
        };

        if (trainerId) fetchDashboardData();
    }, [trainerId]);

    if (loading) return <div className="p-8 text-center text-gray-600">Loading your schedule...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    // Helper: Generate calendar days for the current week
    const today = new Date();
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }); // Monday start
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startOfCurrentWeek, i));

    // Get Today's specific sessions (Individual overrides or specifically scheduled instances)
    const todaysSessions = scheduleData.sessions.filter(session =>
        isSameDay(new Date(session.startTime), today)
    );

    return (
        <div className="bg-gray-50 flex flex-col min-h-full w-full">
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">

                {/* Dashboard Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900">Your Dashboard</h1>
                    <p className="mt-2 text-sm text-gray-600">Welcome back. Here is your upcoming schedule.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Today's Overview */}
                    <div className="lg:col-span-1 space-y-6">
                        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                                <h2 className="text-lg font-bold text-blue-900 flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    Today's Sessions
                                </h2>
                                <p className="text-sm text-blue-600 mt-1">{format(today, 'EEEE, MMMM do')}</p>
                            </div>
                            <div className="p-6">
                                {todaysSessions.length === 0 ? (
                                    <p className="text-gray-500 italic text-center py-4">No specific sessions scheduled for today.</p>
                                ) : (
                                    <ul className="space-y-4">
                                        {todaysSessions.map(session => (
                                            <li key={session.id} className="border-l-4 border-blue-500 pl-4 py-2">
                                                <p className="font-semibold text-gray-900">{session.name}</p>
                                                <p className="text-sm text-gray-600 flex items-center mt-1">
                                                    <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                    {format(new Date(session.startTime), 'h:mm a')} - {format(new Date(session.endTime), 'h:mm a')}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">Room: {session.room?.name || 'Assigned Room'}</p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Weekly Overview (Infinite Recurring Plans) */}
                    <div className="lg:col-span-2">
                        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900">Your Assigned Recurring Plans</h2>
                                <p className="text-sm text-gray-600 mt-1">These are your ongoing weekly responsibilities.</p>
                            </div>
                            <div className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {scheduleData.recurringPlans.length === 0 ? (
                                                <tr>
                                                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500 italic">
                                                        You are not currently assigned to any recurring membership plans.
                                                    </td>
                                                </tr>
                                            ) : (
                                                scheduleData.recurringPlans.map(plan => (
                                                    <tr key={plan.id} className="hover:bg-gray-50 transition">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="font-medium text-blue-600">{plan.name}</div>
                                                            <div className="text-xs text-gray-500 max-w-xs truncate" title={plan.description}>{plan.description}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center text-sm text-gray-900">
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                                                                    {plan.recurringDayOfWeek}
                                                                </span>
                                                                {plan.recurringStartTime} ({plan.durationMinutes} mins)
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {plan.category}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default TrainerDashboard;
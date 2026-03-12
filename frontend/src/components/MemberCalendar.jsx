import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import {
    format, startOfMonth, endOfMonth,
    startOfWeek, endOfWeek, eachDayOfInterval,
    isSameMonth, isSameDay, addMonths, subMonths,
    parseISO, isToday
} from 'date-fns';

export default function MemberCalendar() {
    const currentUser = JSON.parse(localStorage.getItem('user'));

    const [classes, setClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(new Date());
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!currentUser?.id) return;
        setIsLoading(true);
        api.get(`/api/scheduling/member/${currentUser.id}/available-classes`)
            .then(res => setClasses(res.data || []))
            .catch(() => setError("Could not load your schedule. Make sure you have an active membership."))
            .finally(() => setIsLoading(false));
    }, [currentUser?.id]);

    // Build calendar grid: all days in the month view (including leading/trailing days)
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const calendarDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

    const getClassesForDay = (day) =>
        classes.filter(cls => isSameDay(parseISO(cls.startTime), day));

    const selectedDayClasses = getClassesForDay(selectedDay);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-olive dark:border-lightSage"></div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto h-full overflow-y-auto">
            <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-cream tracking-tight mb-1">Class Calendar</h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Your scheduled classes for each week.</p>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-2xl font-medium flex items-center gap-2">
                    ⚠️ {error}
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Calendar Grid */}
                <div className="xl:col-span-2 bg-white dark:bg-darkCard rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                    {/* Month Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                        <button
                            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h2 className="text-xl font-black text-gray-900 dark:text-cream tracking-tight">
                            {format(currentMonth, 'MMMM yyyy')}
                        </h2>
                        <button
                            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Day of Week Headers */}
                    <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-800">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <div key={day} className="py-2 text-center text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days Grid */}
                    <div className="grid grid-cols-7">
                        {calendarDays.map((day, idx) => {
                            const dayClasses = getClassesForDay(day);
                            const isCurrentMonth = isSameMonth(day, currentMonth);
                            const isSelected = isSameDay(day, selectedDay);
                            const isTodayDate = isToday(day);

                            return (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedDay(day)}
                                    className={`relative min-h-[80px] p-2 text-left border-b border-r border-gray-50 dark:border-gray-800/50 transition-colors
                                        ${isSelected ? 'bg-olive/5 dark:bg-lightSage/5' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'}
                                        ${!isCurrentMonth ? 'opacity-30' : ''}
                                    `}
                                >
                                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold transition-colors mb-1
                                        ${isSelected && isTodayDate ? 'bg-olive text-white dark:bg-lightSage dark:text-darkBg' :
                                            isSelected ? 'bg-olive/20 text-olive dark:bg-lightSage/20 dark:text-lightSage' :
                                                isTodayDate ? 'bg-olive text-white dark:bg-lightSage dark:text-darkBg' :
                                                    'text-gray-700 dark:text-gray-300'
                                        }
                                    `}>
                                        {format(day, 'd')}
                                    </span>

                                    {/* Class event pills */}
                                    <div className="space-y-0.5">
                                        {dayClasses.slice(0, 2).map(cls => (
                                            <div
                                                key={cls.sessionId}
                                                className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-olive/10 text-olive dark:bg-lightSage/10 dark:text-lightSage truncate leading-tight"
                                            >
                                                {format(parseISO(cls.startTime), 'h:mm a')} {cls.name}
                                            </div>
                                        ))}
                                        {dayClasses.length > 2 && (
                                            <div className="text-[10px] font-bold text-gray-400 px-1">
                                                +{dayClasses.length - 2} more
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Day Detail Panel */}
                <div className="flex flex-col gap-4">
                    <div className="bg-white dark:bg-darkCard rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
                        <h3 className="font-black text-lg text-gray-900 dark:text-cream mb-1">
                            {format(selectedDay, 'EEEE')}
                        </h3>
                        <p className="text-sm text-gray-400 dark:text-gray-500 font-medium mb-5">
                            {format(selectedDay, 'MMMM d, yyyy')}
                        </p>

                        {selectedDayClasses.length === 0 ? (
                            <div className="text-center py-8">
                                <span className="text-4xl block mb-3 opacity-30">🗓️</span>
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No classes scheduled</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {selectedDayClasses.map(cls => (
                                    <div key={cls.sessionId} className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-olive/30 dark:hover:border-lightSage/30 transition-colors">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] uppercase font-black tracking-widest bg-olive/10 text-olive dark:bg-lightSage/10 dark:text-lightSage px-2 py-0.5 rounded-full">
                                                {format(parseISO(cls.startTime), 'h:mm a')}
                                            </span>
                                            <span className="text-[10px] uppercase font-black bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50 px-2 py-0.5 rounded-full">
                                                ✅ Enrolled
                                            </span>
                                        </div>
                                        <p className="font-black text-gray-900 dark:text-cream text-sm mb-2">{cls.name}</p>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                            <p>⏱️ {format(parseISO(cls.startTime), 'h:mm a')} – {format(parseISO(cls.endTime), 'h:mm a')}</p>
                                            <p>📍 {cls.roomName}</p>
                                            <p>🏃 {cls.trainerFirstName} {cls.trainerLastName}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* This week summary */}
                    <div className="bg-olive/5 dark:bg-lightSage/5 border border-olive/20 dark:border-lightSage/20 rounded-2xl p-4 text-sm">
                        <p className="font-black text-olive dark:text-lightSage mb-1">📊 This Month</p>
                        <p className="text-gray-600 dark:text-gray-400">
                            <span className="font-black text-gray-900 dark:text-cream">{classes.filter(c => isSameMonth(parseISO(c.startTime), currentMonth)).length}</span> classes scheduled
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

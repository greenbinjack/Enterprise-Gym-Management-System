import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function MemberCalendar() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bookingMessage, setBookingMessage] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const currentUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchClasses = async () => {
            setLoading(true);
            try {
                // Fetch classes filtered by user's subscription expiry
                const res = await api.get(`/api/scheduling/member/${currentUser.id}/available-classes`);
                setClasses(res.data);
            } catch (err) {
                console.error("Failed to fetch classes", err);
                setError("Failed to load the class schedule. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        if (currentUser?.id) fetchClasses();
    }, [currentUser?.id]);

    const handleBookClass = async (classId, className) => {
        setBookingMessage(null);
        try {
            await api.post('/api/scheduling/member/book', {
                userId: currentUser.id,
                classId: classId
            });
            setBookingMessage({ type: 'success', text: `Successfully enrolled in ${className}!` });
        } catch (err) {
            console.error("Failed to book class", err);
            setBookingMessage({
                type: 'error',
                text: err.response?.data?.error || `Failed to book ${className}.`
            });
        }
    };

    // Helper: Get start of the week for the selected date
    const getWeekDays = (date) => {
        const start = new Date(date);
        start.setDate(start.getDate() - start.getDay()); // Sunday
        const days = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(start);
            day.setDate(start.getDate() + i);
            days.push(day);
        }
        return days;
    };

    const weekDays = getWeekDays(selectedDate);

    const changeWeek = (offset) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + (offset * 7));
        setSelectedDate(newDate);
    };

    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[500px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-olive dark:border-lightSage"></div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto h-full overflow-y-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-cream tracking-tight mb-2">
                        Class <span className="text-olive dark:text-lightSage">Calendar</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium tracking-wide">
                        Your personalized schedule based on your active plans.
                    </p>
                </div>

                {/* Calendar Navigation */}
                <div className="flex items-center gap-4 bg-white dark:bg-darkCard p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <button
                        onClick={() => changeWeek(-1)}
                        className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="px-4 text-sm font-black text-gray-900 dark:text-cream min-w-[180px] text-center uppercase tracking-widest">
                        {weekDays[0].toLocaleDateString('default', { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <button
                        onClick={() => changeWeek(1)}
                        className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>

            {bookingMessage && (
                <div className={`mb-8 p-5 rounded-2xl font-bold text-sm shadow-sm flex items-center justify-between transition-all animate-in fade-in slide-in-from-top-4 ${bookingMessage.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:border-green-800/50 dark:text-green-400'
                    : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400'
                    }`}>
                    <div className="flex items-center gap-3">
                        <span className="text-xl">{bookingMessage.type === 'success' ? '✅' : '⚠️'}</span>
                        {bookingMessage.text}
                    </div>
                    <button onClick={() => setBookingMessage(null)} className="opacity-50 hover:opacity-100">✕</button>
                </div>
            )}

            {error ? (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-8 rounded-3xl border border-red-200 dark:border-red-800 shadow-sm flex items-start gap-6">
                    <span className="text-4xl mt-0.5">🛑</span>
                    <div>
                        <h3 className="font-extrabold text-xl mb-1">Error Loading Calendar</h3>
                        <p className="font-medium opacity-90">{error}</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                    {weekDays.map((day, idx) => {
                        const dayClasses = classes.filter(cls => {
                            const clsDate = new Date(cls.startTime);
                            return clsDate.getDate() === day.getDate() &&
                                clsDate.getMonth() === day.getMonth() &&
                                clsDate.getFullYear() === day.getFullYear();
                        }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

                        return (
                            <div key={idx} className="flex flex-col">
                                {/* Day Header */}
                                <div className={`text-center mb-4 p-4 rounded-2xl transition-all ${isToday(day)
                                    ? 'bg-olive text-white dark:bg-lightSage dark:text-darkBg shadow-lg shadow-olive/20'
                                    : 'bg-white dark:bg-darkCard text-gray-900 dark:text-cream border border-gray-100 dark:border-gray-800 shadow-sm'
                                    }`}>
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">{day.toLocaleDateString('default', { weekday: 'short' })}</div>
                                    <div className="text-2xl font-black">{day.getDate()}</div>
                                </div>

                                {/* Class Slots Container */}
                                <div className="space-y-3 min-h-[300px]">
                                    {dayClasses.length > 0 ? (
                                        dayClasses.map(cls => (
                                            <ClassCard
                                                key={cls.id}
                                                cls={cls}
                                                onBook={() => handleBookClass(cls.id, cls.name)}
                                            />
                                        ))
                                    ) : (
                                        <div className="h-full flex items-center justify-center p-6 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl text-gray-400 dark:text-gray-600 italic text-[10px] uppercase font-bold tracking-widest text-center">
                                            No Classes
                                        </div>
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

function ClassCard({ cls, onBook }) {
    const startTime = new Date(cls.startTime);
    const isUpcoming = startTime > new Date();
    const isFull = cls.maxCapacity <= 0;

    return (
        <div className="group relative bg-white dark:bg-darkCard rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1 hover:border-olive/30 dark:hover:border-lightSage/30 transition-all duration-300">
            <div className="text-[10px] font-black text-olive dark:text-lightSage mb-2 bg-olive/10 dark:bg-lightSage/10 w-fit px-2 py-0.5 rounded uppercase tracking-wider">
                {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <h4 className="font-extrabold text-gray-900 dark:text-cream text-sm leading-tight mb-2 group-hover:text-olive dark:group-hover:text-lightSage transition-colors line-clamp-2">
                {cls.name}
            </h4>
            <div className="space-y-1.5 mb-4 opacity-70">
                <p className="text-[10px] font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                    <span className="text-sm">📍</span> {cls.room.name}
                </p>
                <p className="text-[10px] font-bold text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                    <span className="text-sm">👤</span> {cls.trainer.firstName}
                </p>
            </div>

            <button
                onClick={onBook}
                disabled={!isUpcoming || isFull}
                className={`w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isUpcoming && !isFull
                    ? 'bg-gray-900 text-white hover:bg-black dark:bg-gray-800 dark:text-cream dark:hover:bg-gray-700 shadow-sm'
                    : 'bg-gray-50 dark:bg-darkBg text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-200 dark:border-gray-800'
                    }`}
            >
                {isUpcoming ? (isFull ? 'Full' : 'Book') : 'Ended'}
            </button>
        </div>
    );
}

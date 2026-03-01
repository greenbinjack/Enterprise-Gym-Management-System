import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function MemberCalendar() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bookingMessage, setBookingMessage] = useState(null);

    const currentUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                // Fetch all classes using the new endpoint with the api wrapper
                const res = await api.get('/api/scheduling/classes');
                setClasses(res.data);
            } catch (err) {
                console.error("Failed to fetch classes", err);
                setError("Failed to load the class schedule. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchClasses();
    }, []);

    const handleBookClass = async (classId, className) => {
        setBookingMessage(null);
        try {
            await api.post('/api/scheduling/member/book', {
                userId: currentUser.id,
                classId: classId
            });
            setBookingMessage({ type: 'success', text: `Successfully enrolled in ${className}!` });

            // Re-fetch to update capacities (if we implement real-time seat tracking later)
        } catch (err) {
            console.error("Failed to book class", err);
            setBookingMessage({
                type: 'error',
                text: err.response?.data?.error || `Failed to book ${className}.`
            });
        }
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
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-cream tracking-tight mb-2">
                    Class <span className="text-olive dark:text-lightSage">Calendar</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium tracking-wide">Browse and book upcoming fitness classes led by professional trainers.</p>
            </div>

            {bookingMessage && (
                <div className={`mb-8 p-5 rounded-2xl font-bold text-sm shadow-sm flex items-center justify-between transition-all ${bookingMessage.type === 'success'
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
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-2xl border border-red-200 dark:border-red-800 shadow-sm flex items-start gap-4">
                    <span className="text-2xl mt-0.5">🛑</span>
                    <div>
                        <h3 className="font-bold text-lg mb-1">Error Loading Calendar</h3>
                        <p className="text-sm font-medium opacity-90">{error}</p>
                    </div>
                </div>
            ) : classes.length === 0 ? (
                <div className="text-center py-20 px-6 bg-white dark:bg-darkCard rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <span className="text-6xl mb-6 block opacity-80">📅</span>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-cream mb-2">No Classes Scheduled</h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium max-w-sm mx-auto">The schedule is currently empty. Check back later for new upcoming sessions!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {classes.map(cls => {
                        const startDate = new Date(cls.startTime);
                        const isUpcoming = startDate > new Date();
                        const isFull = cls.maxCapacity <= 0; // Simplified capacity check for UI

                        return (
                            <div key={cls.id} className="bg-white dark:bg-darkCard rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col h-full hover:shadow-lg hover:border-olive/30 dark:hover:border-lightSage/30 transition-all group duration-300">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="bg-gray-50 dark:bg-darkBg border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-cream px-4 py-2.5 rounded-2xl text-center min-w-[70px] group-hover:bg-olive group-hover:text-white dark:group-hover:bg-lightSage dark:group-hover:text-darkBg group-hover:border-transparent transition-colors shadow-sm">
                                        <div className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-0.5">{startDate.toLocaleString('default', { month: 'short' })}</div>
                                        <div className="text-2xl font-black leading-none">{startDate.getDate()}</div>
                                    </div>
                                    <span className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm whitespace-nowrap">
                                        <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                        {cls.room.name}
                                    </span>
                                </div>

                                <div className="flex-grow flex flex-col">
                                    <h3 className="text-xl font-black text-gray-900 dark:text-cream mb-2 leading-tight">{cls.name}</h3>
                                    <p className="inline-flex items-center w-fit text-olive dark:text-lightSage bg-olive/10 dark:bg-lightSage/10 font-bold text-xs px-2.5 py-1 rounded border border-olive/20 dark:border-lightSage/20 mb-5 shadow-sm">
                                        <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>

                                    <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-darkBg/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 mt-auto">
                                        <p className="flex items-center">
                                            <span className="w-6 flex justify-center opacity-70">👤</span>
                                            <span className="font-bold text-gray-900 dark:text-cream text-xs uppercase tracking-wide ml-2 bg-white dark:bg-darkCard px-2 py-1 rounded shadow-sm border border-gray-200 dark:border-gray-700 truncate">{cls.trainer.firstName} {cls.trainer.lastName}</span>
                                        </p>
                                        <p className="flex items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                                            <span className="w-6 flex justify-center opacity-70">👥</span>
                                            <span className="flex items-center ml-2 text-xs font-bold text-gray-900 dark:text-gray-300">
                                                {cls.maxCapacity} <span className="opacity-70 ml-1 font-medium">Spots Total</span>
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleBookClass(cls.id, cls.name)}
                                    disabled={!isUpcoming || isFull}
                                    className={`mt-6 w-full py-3.5 rounded-xl font-bold transition-all shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-olive dark:focus:ring-offset-darkBg flex items-center justify-center gap-2
                                        ${isUpcoming && !isFull
                                            ? 'bg-olive hover:bg-olive/90 text-white dark:bg-lightSage dark:text-darkBg dark:hover:bg-lightSage/90 hover:shadow-md hover:-translate-y-0.5'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-200 dark:border-gray-700'}`}
                                >
                                    {isUpcoming ? (isFull ? 'Class Full' : 'Book Class') : 'Class Ended'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

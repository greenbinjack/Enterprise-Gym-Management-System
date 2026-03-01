import { useState, useEffect } from 'react';
import axios from 'axios';

export default function MemberCalendar() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bookingMessage, setBookingMessage] = useState(null);

    const currentUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                // Fetch all classes using the new endpoint
                const res = await axios.get('http://localhost:8080/api/scheduling/classes');
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
            await axios.post('http://localhost:8080/api/scheduling/member/book', {
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Class Calendar</h1>
            <p className="text-gray-500 mb-8">Browse and book upcoming fitness classes.</p>

            {bookingMessage && (
                <div className={`mb-6 p-4 rounded-lg font-bold ${bookingMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {bookingMessage.text}
                </div>
            )}

            {error ? (
                <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200">
                    <p className="font-bold">{error}</p>
                </div>
            ) : classes.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
                    <span className="text-6xl mb-4 block">📅</span>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Classes Scheduled</h3>
                    <p className="text-gray-500">Check back later for new upcoming sessions!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classes.map(cls => {
                        const startDate = new Date(cls.startTime);
                        const isUpcoming = startDate > new Date();

                        return (
                            <div key={cls.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col h-full hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-center min-w-[60px]">
                                        <div className="text-xs font-bold uppercase">{startDate.toLocaleString('default', { month: 'short' })}</div>
                                        <div className="text-xl font-black leading-none">{startDate.getDate()}</div>
                                    </div>
                                    <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2 py-1 rounded">
                                        {cls.room.name}
                                    </span>
                                </div>

                                <div className="flex-grow">
                                    <h3 className="text-xl font-extrabold text-gray-900 mb-1">{cls.name}</h3>
                                    <p className="text-blue-600 font-bold text-sm mb-4">
                                        🕒 {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>

                                    <div className="space-y-2 text-sm text-gray-600">
                                        <p className="flex items-center">
                                            <span className="mr-2">👤</span>
                                            Trainer: <span className="font-semibold ml-1">{cls.trainer.firstName} {cls.trainer.lastName}</span>
                                        </p>
                                        <p className="flex items-center">
                                            <span className="mr-2">👥</span>
                                            Capacity: <span className="font-semibold ml-1">{cls.maxCapacity} seats</span>
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleBookClass(cls.id, cls.name)}
                                    disabled={!isUpcoming}
                                    className={`mt-6 w-full py-3 rounded-xl font-bold transition-all shadow-sm
                                        ${isUpcoming
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                >
                                    {isUpcoming ? 'Book Class' : 'Class Ended'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

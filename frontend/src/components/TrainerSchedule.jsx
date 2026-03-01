import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function TrainerSchedule() {
    const [myClasses, setMyClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMySchedule = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                if (!storedUser || storedUser.role !== 'TRAINER') return;

                // Use the configured api wrapper
                const response = await api.get(`/api/scheduling/trainer/${storedUser.id}/classes`);
                setMyClasses(response.data);
            } catch (error) {
                console.error("Failed to load trainer schedule", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMySchedule();
    }, []);

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto h-full overflow-y-auto w-full">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-cream tracking-tight mb-2">
                    My Teaching <span className="text-olive dark:text-lightSage">Schedule</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium tracking-wide">View your assigned classes and manage your roster.</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-20 min-h-[300px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-olive dark:border-lightSage"></div>
                </div>
            ) : myClasses.length === 0 ? (
                <div className="text-center py-16 px-6 bg-white dark:bg-darkCard rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <span className="text-6xl mb-6 block opacity-80">🛋️</span>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-cream mb-2">No Classes Assigned</h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">You have a clear schedule! Enjoy your free time.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {myClasses.map(cls => {
                        const startDate = new Date(cls.startTime);
                        const endDate = new Date(cls.endTime);
                        const isUpcoming = startDate > new Date();

                        return (
                            <div key={cls.id} className="bg-white dark:bg-darkCard rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col h-full hover:shadow-lg hover:border-olive/30 dark:hover:border-lightSage/30 transition-all group duration-300">
                                <div className="flex justify-between items-start mb-5 gap-3">
                                    <h3 className="text-lg font-black text-gray-900 dark:text-cream leading-tight">{cls.name}</h3>
                                    <span className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm whitespace-nowrap flex-shrink-0">
                                        <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                        {cls.room.name}
                                    </span>
                                </div>

                                <div className="space-y-4 flex-grow mb-6 bg-gray-50/50 dark:bg-darkBg/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-gray-700 w-12 py-1.5 rounded-lg text-center shadow-sm">
                                            <div className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">{startDate.toLocaleString('default', { month: 'short' })}</div>
                                            <div className="text-lg font-black text-gray-900 dark:text-cream leading-none">{startDate.getDate()}</div>
                                        </div>
                                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 flex flex-col justify-center h-12">
                                            <p className="flex items-center gap-1.5">
                                                <svg className="w-4 h-4 opacity-70 text-olive dark:text-lightSage" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <p className="flex items-center gap-1.5 mt-0.5 text-xs opacity-80">
                                                <span className="w-4 inline-block text-center">to</span>
                                                {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    disabled={!isUpcoming}
                                    className={`w-full py-3.5 rounded-xl font-bold transition-all shadow-sm focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2 mt-auto
                                    ${isUpcoming
                                            ? 'bg-gray-900 hover:bg-black text-white dark:bg-cream dark:text-darkBg dark:hover:bg-white focus:ring-gray-900 dark:focus:ring-cream hover:shadow-md'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed border-transparent'
                                        }`}
                                >
                                    {isUpcoming ? (
                                        <><span>📝</span> Open Live Roster</>
                                    ) : 'Session Ended'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
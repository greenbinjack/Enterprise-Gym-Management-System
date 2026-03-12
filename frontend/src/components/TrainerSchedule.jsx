import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { format, isSameMonth, startOfMonth, addMonths, subMonths } from 'date-fns';

export default function TrainerSchedule() {
    const [myClasses, setMyClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    
    // Roster Modal State
    const [roster, setRoster] = useState([]);
    const [isRosterLoading, setIsRosterLoading] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchMySchedule = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                if (!storedUser || storedUser.role !== 'TRAINER') return;

                const response = await api.get(`/api/scheduling/trainer/${storedUser.id}/dashboard`);
                const sessions = Array.isArray(response.data?.sessions)
                    ? response.data.sessions
                    : [];
                setMyClasses(sessions);
            } catch (error) {
                console.error("Failed to load trainer schedule", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMySchedule();
    }, []);

    const fetchParticipants = async (sessionId, sessionName) => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        setSelectedSession(sessionName);
        setIsModalOpen(true);
        setIsRosterLoading(true);
        try {
            const response = await api.get(`/api/scheduling/trainer/${storedUser.id}/classes/${sessionId}/participants`);
            setRoster(response.data || []);
        } catch (error) {
            console.error("Failed to fetch participants", error);
        } finally {
            setIsRosterLoading(false);
        }
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const filteredClasses = myClasses.filter(cls => 
        isSameMonth(new Date(cls.startTime), currentMonth)
    );

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto h-full overflow-y-auto w-full relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-cream tracking-tight mb-2">
                        My Teaching <span className="text-olive dark:text-lightSage">Schedule</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium tracking-wide">View your assigned classes and manage your roster.</p>
                </div>

                {/* Month Navigation */}
                <div className="flex items-center gap-4 bg-white dark:bg-darkCard p-2 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <span className="text-lg font-black min-w-[140px] text-center dark:text-cream">{format(currentMonth, 'MMMM yyyy')}</span>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-20 min-h-[300px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-olive dark:border-lightSage"></div>
                </div>
            ) : filteredClasses.length === 0 ? (
                <div className="text-center py-16 px-6 bg-white dark:bg-darkCard rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <span className="text-6xl mb-6 block opacity-80">🛋️</span>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-cream mb-2">No Classes in {format(currentMonth, 'MMMM')}</h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-lg leading-relaxed max-w-md mx-auto">
                        Your schedule is clear for this month. You can check other months using the navigation above.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredClasses.map(cls => {
                        const startDate = new Date(cls.startTime);
                        const endDate = new Date(cls.endTime);

                        return (
                            <div key={cls.id} className="bg-white dark:bg-darkCard rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col h-full hover:shadow-lg hover:border-olive/30 dark:hover:border-lightSage/30 transition-all group duration-300">
                                <div className="flex justify-between items-start mb-5 gap-3 text-left">
                                    <h3 className="text-lg font-black text-gray-900 dark:text-cream leading-tight">{cls.name}</h3>
                                    <span className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm whitespace-nowrap flex-shrink-0">
                                        <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                        {cls.room?.name || 'Assigned Room'}
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
                                                <span className="w-4 inline-block text-center text-[10px]">TO</span>
                                                {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => fetchParticipants(cls.id, cls.name)}
                                    className="w-full py-3.5 rounded-xl font-bold transition-all shadow-sm focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2 mt-auto bg-gray-900 hover:bg-black text-white dark:bg-cream dark:text-darkBg dark:hover:bg-white focus:ring-gray-900 dark:focus:ring-cream hover:shadow-md"
                                >
                                    <span>👥</span> View Participant Roster
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Roster Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-darkCard w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-100 dark:border-gray-800">
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-darkBg/50">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-cream leading-tight">{selectedSession}</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold tracking-widest uppercase mt-1">Class Participant Roster</p>
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-gray-500"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l18 18" /></svg>
                            </button>
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            {isRosterLoading ? (
                                <div className="flex flex-col items-center justify-center py-10 gap-4">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-olive dark:border-lightSage"></div>
                                    <p className="text-sm font-bold text-gray-400 animate-pulse">Fetching members...</p>
                                </div>
                            ) : roster.length === 0 ? (
                                <div className="text-center py-10">
                                    <span className="text-4xl block mb-4">📭</span>
                                    <p className="text-gray-900 dark:text-cream font-black">Roster is Empty</p>
                                    <p className="text-sm text-gray-500 mt-1">No members are currently enrolled for this session via active plans.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {roster.map(person => (
                                        <div key={person.id} className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50 dark:bg-darkBg border border-gray-100 dark:border-gray-800 shadow-sm transition-transform hover:scale-[1.02]">
                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-olive/10 dark:bg-lightSage/10 flex-shrink-0 border-2 border-white dark:border-gray-700 shadow-sm">
                                                {person.photoUrl ? (
                                                    <img src={person.photoUrl} alt={person.firstName} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-olive dark:text-lightSage font-black text-lg">
                                                        {person.firstName[0]}{person.lastName[0]}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-black text-gray-900 dark:text-cream truncate leading-tight">{person.firstName} {person.lastName}</p>
                                                <p className="text-[10px] text-green-600 dark:text-green-400 font-black uppercase tracking-widest mt-0.5">Active Subscription</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 bg-gray-50/50 dark:bg-darkBg/50 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Participants</span>
                            <span className="bg-olive/10 text-olive dark:bg-lightSage/10 dark:text-lightSage px-3 py-1 rounded-full text-sm font-black border border-olive/20 dark:border-lightSage/20">
                                {roster.length} Member{roster.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
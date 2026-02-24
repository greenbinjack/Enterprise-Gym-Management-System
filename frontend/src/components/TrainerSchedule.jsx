import { useState, useEffect } from 'react';
import axios from 'axios';
import BackButton from './BackButton';

export default function TrainerSchedule() {
    const [myClasses, setMyClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMySchedule = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem('user'));
                if (!storedUser || storedUser.role !== 'TRAINER') return;

                const response = await axios.get(`http://localhost:8080/api/scheduling/trainer/${storedUser.id}/classes`);
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
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-5xl mx-auto">
                <BackButton />
                <h2 className="text-3xl font-extrabold text-gray-900 mb-8">My Teaching Schedule</h2>

                {isLoading ? (
                    <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
                ) : myClasses.length === 0 ? (
                    <div className="bg-white p-8 rounded-xl shadow border text-center text-gray-500">
                        You have no classes assigned at the moment.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myClasses.map(cls => (
                            <div key={cls.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-gray-900">{cls.name}</h3>
                                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                                        {cls.room.name}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-6 text-gray-600 text-sm">
                                    <p className="flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                        {new Date(cls.startTime).toLocaleDateString()}
                                    </p>
                                    <p className="flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        {new Date(cls.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(cls.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>

                                <button className="w-full py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium transition-colors">
                                    Open Live Roster
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function AdminCheckIn() {
    const [activeMembers, setActiveMembers] = useState([]);

    // Initial load and periodic refresh of active roster
    const fetchActiveRoster = async () => {
        try {
            const res = await api.get('/api/checkin/active');
            setActiveMembers(res.data);
        } catch (error) {
            console.error("Failed to load active check-ins", error);
        }
    };

    useEffect(() => {
        fetchActiveRoster();
        const intervalId = setInterval(fetchActiveRoster, 120000); // 2 min refresh
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
            <div className="mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Access Control</h1>
                    <p className="text-gray-500">Live facility roster</p>
                </div>
            </div>

            {/* Live Roster Table */}
            <div className="bg-white border text-left border-gray-200 shadow-sm rounded-2xl overflow-hidden flex-1 flex flex-col">
                <div className="p-6 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="font-bold text-gray-900 text-lg flex items-center">
                        <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse mr-3"></span>
                        Currently Inside
                    </h2>
                    <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-sm font-black">
                        {activeMembers.length} Members
                    </span>
                </div>

                <div className="overflow-y-auto flex-1 p-0">
                    {activeMembers.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center py-20 text-gray-400">
                            <span className="text-6xl mb-4">🏛️</span>
                            <p className="text-lg font-bold">The facility is currently empty.</p>
                        </div>
                    ) : (
                        <table className="w-full whitespace-nowrap">
                            <thead className="bg-white sticky top-0 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider text-left">Member</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider text-left">Email Address</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider text-right">Time Entered</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {activeMembers.map((member) => (
                                    <tr key={member.checkInId} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-full overflow-hidden border border-gray-200">
                                                    {member.photoUrl ? (
                                                        <img className="h-full w-full object-cover" src={member.photoUrl} alt="" />
                                                    ) : (
                                                        <div className="h-full w-full flex justify-center items-center text-gray-400 font-bold text-lg">
                                                            {member.firstName.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-extrabold text-gray-900">{member.firstName} {member.lastName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                            {member.email}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 font-bold text-right">
                                            {new Date(member.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

        </div>
    );
}

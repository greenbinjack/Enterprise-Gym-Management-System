import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function TrainerDashboard() {
    const [user, setUser] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
            return;
        }

        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== 'TRAINER') {
            alert("Access Denied: Trainer portal only.");
            navigate('/dashboard');
            return;
        }

        setUser(parsedUser);
        fetchNotifications(parsedUser.id);
    }, [navigate]);

    const fetchNotifications = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/trainer/${userId}/notifications`);
            setNotifications(response.data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
                <span className="text-xl font-bold">Trainer Portal</span>
                <div className="flex items-center space-x-4">
                    <span className="text-sm">Instructor {user.firstName}</span>
                    <button onClick={handleLogout} className="px-4 py-2 text-sm border border-red-400 text-red-400 hover:bg-red-500 hover:text-white rounded transition-colors">Logout</button>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Notifications */}
                <div className="md:col-span-1 bg-white rounded-xl shadow p-6 border border-gray-200 h-fit">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center justify-between">
                        System Alerts <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{notifications.length}</span>
                    </h3>
                    <div className="space-y-3">
                        {notifications.length === 0 && <p className="text-sm text-gray-500">No new notifications.</p>}
                        {notifications.map(notif => (
                            <div key={notif.id} className={`p-3 rounded-lg border ${notif.isRead ? 'bg-gray-50 border-gray-100' : 'bg-blue-50 border-blue-200'}`}>
                                <p className="text-sm text-gray-800">{notif.message}</p>
                                <span className="text-xs text-gray-400 mt-2 block">{new Date(notif.date).toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Master Schedule Placeholder */}
                <div className="md:col-span-2 bg-white rounded-xl shadow p-6 border border-gray-200 flex flex-col items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <span className="text-6xl mb-4 block">📅</span>
                        <h2 className="text-2xl font-bold text-gray-800">Your Master Schedule</h2>
                        <p className="text-gray-500 mt-2">The Admin has not assigned you to any classes yet.</p>
                        <p className="text-sm text-blue-500 mt-4 font-mono">[ Scheduling Module Coming Next ]</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
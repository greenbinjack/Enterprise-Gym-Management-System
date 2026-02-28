import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function MemberDashboard() {
    const currentUser = JSON.parse(localStorage.getItem('user'));

    // State Management
    const [user, setUser] = useState({ firstName: currentUser?.firstName || 'Member', isProfileComplete: true });
    const [activeSubscriptions, setActiveSubscriptions] = useState([]);
    const [isScanning, setIsScanning] = useState(false);

    // Dummy schedule data (we will wire this to the real backend next!)
    const [upcomingClasses] = useState([
        { id: 1, name: 'HIIT Core', time: 'Today, 18:00', duration: 45, trainer: 'Sarah Connor', room: 'Studio A' },
        { id: 2, name: 'Morning Yoga', time: 'Tomorrow, 07:00', duration: 60, trainer: 'David Goggins', room: 'Studio B' }
    ]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Fetch Profile status to hide/show the warning banner
                const profileRes = await axios.get(`http://localhost:8080/api/member/profile/${currentUser.id}`);
                setUser({
                    firstName: profileRes.data.firstName,
                    isProfileComplete: profileRes.data.isProfileComplete
                });

                // 2. Fetch Subscription Status to get all active plans
                const subRes = await axios.get(`http://localhost:8080/api/subscriptions/status/${currentUser.id}`);

                // Filter out only the ACTIVE or GRACE_PERIOD subscriptions
                const active = subRes.data.filter(sub => sub.status === 'ACTIVE' || sub.status === 'GRACE_PERIOD');
                setActiveSubscriptions(active);

            } catch (error) {
                console.error("Failed to load dashboard data", error);
            }
        };

        if (currentUser?.id) fetchDashboardData();
    }, [currentUser?.id]);

    // Derived states for UI logic
    const hasAnyActivePlan = activeSubscriptions.length > 0;
    const accessStatus = hasAnyActivePlan ? 'ACTIVE' : 'NO ACCESS';

    const handleSimulateScan = () => {
        setIsScanning(true);
        setTimeout(() => {
            setIsScanning(false);
            alert("✅ Check-in recorded successfully!");
        }, 1500);
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome back, {user.firstName}!</h1>
            <p className="text-gray-500 mb-8">Here is your fitness overview for this week.</p>

            {/* THE GATEKEEPER BANNER */}
            {!user.isProfileComplete && (
                <div className="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between">
                    <div className="mb-4 md:mb-0">
                        <h3 className="text-yellow-800 font-bold text-lg">⚠️ Action Required: Complete Your Profile</h3>
                        <p className="text-yellow-700 text-sm mt-1">You must upload a photo and add your phone number before you can purchase plans or scan into the gym.</p>
                    </div>
                    <Link to="/member/profile" className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-2 px-6 rounded-lg shadow whitespace-nowrap transition-colors">
                        Update Profile Now
                    </Link>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT COLUMN: Access & Active Plans */}
                <div className="space-y-8">

                    {/* The QR Scanner Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
                        <h3 className="font-bold text-gray-900 mb-2">Digital Access Pass</h3>
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-black mb-6 ${hasAnyActivePlan ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            STATUS: {accessStatus}
                        </div>

                        <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-300 mb-4 flex items-center justify-center">
                            <span className="text-6xl">📱</span>
                        </div>

                        <button
                            onClick={handleSimulateScan}
                            disabled={isScanning || !user.isProfileComplete || !hasAnyActivePlan}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg transition-all flex justify-center items-center space-x-2"
                        >
                            {isScanning ? (
                                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                            ) : (
                                <><span>📷</span> <span>Scan Front Desk QR</span></>
                            )}
                        </button>
                        {!hasAnyActivePlan && user.isProfileComplete && (
                            <p className="text-xs text-red-500 font-bold mt-3">You need an active plan to enter.</p>
                        )}
                        <p className="text-xs text-gray-400 mt-3">Scan the code at the entrance to log your visit.</p>
                    </div>

                    {/* Active Subscriptions Display */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-bold text-gray-900 mb-4">My Active Plans</h3>
                        <div className="space-y-3">
                            {activeSubscriptions.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">You have no active memberships.</p>
                            ) : (
                                activeSubscriptions.map(sub => (
                                    <div key={sub.planId} className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-sm text-gray-800 leading-tight pr-2">{sub.planName}</span>
                                            <span className="text-[10px] uppercase font-black bg-green-100 text-green-800 px-2 py-0.5 rounded">Active</span>
                                        </div>
                                        <div className="text-xs text-gray-500 font-medium">
                                            Expires: {new Date(sub.endDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="mt-4 pt-4 border-t text-center">
                            <Link to="/member/store" className="text-blue-600 text-sm font-bold hover:text-blue-800 transition-colors">
                                Buy or Upgrade Plans ➔
                            </Link>
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN: The Schedule */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-xl text-gray-900">🗓️ My Schedule This Week</h3>
                        <Link to="/member/calendar" className="text-blue-600 hover:text-blue-800 text-sm font-bold transition-colors">Book More ➔</Link>
                    </div>

                    <div className="space-y-4 flex-1">
                        {upcomingClasses.length === 0 ? (
                            <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300 h-full flex flex-col items-center justify-center">
                                <p className="text-gray-500 mb-3 text-lg">You have no upcoming classes.</p>
                                <Link to="/member/calendar" className="text-blue-600 font-bold hover:underline">Explore the calendar</Link>
                            </div>
                        ) : (
                            upcomingClasses.map(cls => (
                                <div key={cls.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-blue-50 transition-colors">
                                    <div className="flex items-start space-x-4">
                                        <div className="bg-blue-100 text-blue-700 p-3 rounded-lg font-bold text-center leading-tight min-w-[60px]">
                                            <div className="text-xs uppercase">MAR</div>
                                            <div className="text-xl">03</div>
                                        </div>
                                        <div>
                                            <h4 className="font-extrabold text-gray-900 text-lg">{cls.name}</h4>
                                            <p className="text-sm text-gray-600 font-medium">🕒 {cls.time} ({cls.duration} min)</p>
                                            <p className="text-xs text-gray-500 mt-1 font-medium">👤 {cls.trainer} &nbsp;|&nbsp; 📍 {cls.room}</p>
                                        </div>
                                    </div>
                                    <button className="mt-4 sm:mt-0 px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-bold transition-colors shadow-sm">
                                        Cancel
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
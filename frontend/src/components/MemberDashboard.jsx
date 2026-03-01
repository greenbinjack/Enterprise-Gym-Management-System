import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Scanner } from '@yudiel/react-qr-scanner';

export default function MemberDashboard() {
    const currentUser = JSON.parse(localStorage.getItem('user'));

    // State Management
    const [user, setUser] = useState({ firstName: currentUser?.firstName || 'Member', isProfileComplete: true });
    const [activeSubscriptions, setActiveSubscriptions] = useState([]);
    const [isScanningMode, setIsScanningMode] = useState(false);
    const [scanResult, setScanResult] = useState(null);

    // Fetch real classes below
    const [upcomingClasses, setUpcomingClasses] = useState([]);

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

                // 3. Fetch Scheduled Classes
                const classRes = await axios.get(`http://localhost:8080/api/scheduling/member/${currentUser.id}/bookings`);
                setUpcomingClasses(classRes.data);

            } catch (error) {
                console.error("Failed to load dashboard data", error);
            }
        };

        if (currentUser?.id) fetchDashboardData();
    }, [currentUser?.id]);

    // Derived states for UI logic
    const hasAnyActivePlan = activeSubscriptions.length > 0;
    const accessStatus = hasAnyActivePlan ? 'ACTIVE' : 'NO ACCESS';

    const handleCameraScan = async (scannedText) => {
        // Prevent barrage of scans while processing
        if (scanResult) return;

        try {
            const res = await axios.post('http://localhost:8080/api/checkin/scan', {
                userId: currentUser.id,
                locationId: scannedText
            });

            setScanResult({
                type: 'success',
                message: res.data.message,
                status: res.data.status // ENTER or EXIT
            });

        } catch (error) {
            setScanResult({
                type: 'error',
                message: error.response?.data?.error || "Invalid QR Code."
            });
        } finally {
            // Re-open scanner after 5 seconds
            setTimeout(() => {
                setScanResult(null);
                setIsScanningMode(false);
            }, 5000);
        }
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

                        {/* Live Camera Scanner Logic */}
                        {!isScanningMode && !scanResult ? (
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-4 inline-block w-full">
                                <div className="aspect-square bg-gray-50 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300 p-6 text-gray-500">
                                    <span className="text-5xl mb-3">📍</span>
                                    <h4 className="font-bold text-gray-800 mb-1">Pass Required</h4>
                                    <p className="text-xs text-center">Scan the Front Desk QR code to log your visit.</p>
                                </div>
                            </div>
                        ) : isScanningMode && !scanResult ? (
                            <div className="bg-black p-2 rounded-xl border border-gray-200 shadow-sm mb-4 w-full aspect-square overflow-hidden relative">
                                <Scanner
                                    onScan={(detectedCodes) => {
                                        if (detectedCodes && detectedCodes.length > 0) {
                                            handleCameraScan(detectedCodes[0].rawValue);
                                        }
                                    }}
                                    components={{
                                        audio: false,
                                        finder: false
                                    }}
                                    styles={{ container: { width: '100%', height: '100%' } }}
                                />
                                <div className="absolute inset-0 border-4 border-blue-500/50 rounded-xl pointer-events-none animate-pulse"></div>
                                <button
                                    onClick={() => setIsScanningMode(false)}
                                    className="absolute top-4 right-4 bg-gray-900/80 text-white rounded-full p-2 hover:bg-red-500 transition-colors"
                                >
                                    ❌
                                </button>
                            </div>
                        ) : null}

                        {scanResult && (
                            <div className={`p-6 rounded-xl border-2 shadow-sm mb-4 w-full flex flex-col items-center justify-center aspect-square ${scanResult.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                                    scanResult.status === 'ENTER' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-blue-50 border-blue-200 text-blue-800'
                                }`}>
                                <span className="text-6xl mb-4">
                                    {scanResult.type === 'error' ? '❌' : scanResult.status === 'ENTER' ? '👋' : '🏃'}
                                </span>
                                <h3 className="font-extrabold text-xl text-center leading-tight mb-2">{scanResult.message}</h3>
                                {scanResult.type === 'success' && <p className="text-xs font-bold uppercase tracking-widest opacity-70">Logged {scanResult.status}</p>}
                            </div>
                        )}

                        {!isScanningMode && !scanResult && (
                            <button
                                onClick={() => setIsScanningMode(true)}
                                disabled={!user.isProfileComplete || !hasAnyActivePlan}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg transition-all flex justify-center items-center space-x-2"
                            >
                                <><span>📷</span> <span>Open Camera Scanner</span></>
                            </button>
                        )}

                        {!hasAnyActivePlan && user.isProfileComplete && (
                            <p className="text-xs text-red-500 font-bold mt-3">You need an active plan to use the scanner.</p>
                        )}
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
                            upcomingClasses.map(cls => {
                                const startDate = new Date(cls.startTime);
                                const endDate = new Date(cls.endTime);
                                const timeStr = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    + " - " +
                                    endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                return (
                                    <div key={cls.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-blue-50 transition-colors">
                                        <div className="flex items-start space-x-4">
                                            <div className="bg-blue-100 text-blue-700 p-3 rounded-lg font-bold text-center leading-tight min-w-[60px]">
                                                <div className="text-xs uppercase">{startDate.toLocaleString('default', { month: 'short' })}</div>
                                                <div className="text-xl">{startDate.getDate()}</div>
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <h4 className="font-extrabold text-gray-900 text-lg">{cls.name}</h4>
                                                    <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${cls.status === 'WAITLISTED' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                                        }`}>
                                                        {cls.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 font-medium">🕒 {timeStr}</p>
                                                <p className="text-xs text-gray-500 mt-1 font-medium">👤 {cls.trainer} &nbsp;|&nbsp; 📍 {cls.room}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
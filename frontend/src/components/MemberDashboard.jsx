import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { Scanner } from '@yudiel/react-qr-scanner';

export default function MemberDashboard() {
    const currentUser = JSON.parse(localStorage.getItem('user'));

    // State Management
    const [user, setUser] = useState({ firstName: currentUser?.firstName || 'Member', isProfileComplete: true });
    const [activeSubscriptions, setActiveSubscriptions] = useState([]);
    const [isScanningMode, setIsScanningMode] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [upcomingClasses, setUpcomingClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch Profile status
                const profileRes = await api.get(`/api/member/profile/${currentUser.id}`);
                setUser({
                    firstName: profileRes.data.firstName,
                    isProfileComplete: profileRes.data.isProfileComplete
                });

                // 2. Fetch Subscription Status
                const subRes = await api.get(`/api/subscriptions/status/${currentUser.id}`);
                const active = subRes.data.filter(sub => sub.status === 'ACTIVE' || sub.status === 'GRACE_PERIOD');
                setActiveSubscriptions(active);

                // 3. Fetch Scheduled Classes
                const classRes = await api.get(`/api/scheduling/member/${currentUser.id}/bookings`);
                setUpcomingClasses(classRes.data);

            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (currentUser?.id) fetchDashboardData();
    }, [currentUser?.id]);

    const hasAnyActivePlan = activeSubscriptions.length > 0;
    const accessStatus = hasAnyActivePlan ? 'ACTIVE' : 'NO ACCESS';

    const handleCameraScan = async (scannedText) => {
        if (scanResult) return;

        try {
            const res = await api.post('/api/checkin/scan', {
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
            setTimeout(() => {
                setScanResult(null);
                setIsScanningMode(false);
            }, 5000);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-olive dark:border-lightSage"></div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto h-full overflow-y-auto">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-cream tracking-tight mb-2">
                    Welcome back, <span className="text-olive dark:text-lightSage">{user.firstName}</span>!
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Here is your fitness overview for this week.</p>
            </div>

            {/* THE GATEKEEPER BANNER */}
            {!user.isProfileComplete && (
                <div className="mb-10 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 p-5 rounded-r-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all">
                    <div>
                        <h3 className="text-yellow-800 dark:text-yellow-400 font-bold text-lg mb-1 flex items-center gap-2">
                            <span>⚠️</span> Action Required: Complete Your Profile
                        </h3>
                        <p className="text-yellow-700 dark:text-yellow-500 text-sm font-medium">You must upload a photo and add your phone number before you can purchase plans or scan into the gym.</p>
                    </div>
                    <Link
                        to="/member/profile"
                        className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 dark:bg-yellow-500 dark:hover:bg-yellow-400 dark:text-yellow-900 font-bold py-2.5 px-6 rounded-xl shadow-sm whitespace-nowrap transition-colors w-full md:w-auto text-center"
                    >
                        Update Profile Now
                    </Link>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT COLUMN: Access & Active Plans */}
                <div className="space-y-8">

                    {/* The QR Scanner Card */}
                    <div className="bg-white dark:bg-darkCard rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col items-center text-center transition-transform hover:-translate-y-1">
                        <h3 className="font-bold text-gray-900 dark:text-cream text-lg mb-3">Digital Access Pass</h3>
                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black mb-8 tracking-widest uppercase shadow-sm ${hasAnyActivePlan
                                ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50'
                                : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50'
                            }`}>
                            <span className={`w-2 h-2 rounded-full ${hasAnyActivePlan ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            STATUS: {accessStatus}
                        </div>

                        {/* Live Camera Scanner Logic */}
                        {!isScanningMode && !scanResult ? (
                            <div className="bg-gray-50 dark:bg-darkBg w-full aspect-square rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 p-6 mb-6">
                                <div className="w-16 h-16 bg-white dark:bg-darkCard rounded-full flex items-center justify-center shadow-sm mb-4">
                                    <span className="text-2xl">📱</span>
                                </div>
                                <h4 className="font-bold text-gray-900 dark:text-cream mb-2">Pass Required</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[200px]">Use the camera scanner to log your visit at the Front Desk.</p>
                            </div>
                        ) : isScanningMode && !scanResult ? (
                            <div className="bg-black w-full aspect-square rounded-2xl shadow-inner mb-6 relative overflow-hidden group">
                                <Scanner
                                    onScan={(detectedCodes) => {
                                        if (detectedCodes && detectedCodes.length > 0) {
                                            handleCameraScan(detectedCodes[0].rawValue);
                                        }
                                    }}
                                    components={{ audio: false, finder: false }}
                                    styles={{ container: { width: '100%', height: '100%' } }}
                                />
                                <div className="absolute inset-0 border-4 border-olive/50 dark:border-lightSage/50 rounded-2xl pointer-events-none animate-pulse"></div>
                                {/* Scanning Reticle Overlay */}
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white/30 rounded-3xl pointer-events-none flex items-center justify-center">
                                    <div className="w-full h-[2px] bg-red-500/50 animate-scan"></div>
                                </div>
                                <button
                                    onClick={() => setIsScanningMode(false)}
                                    className="absolute top-4 right-4 bg-gray-900/80 hover:bg-red-500 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
                                >
                                    ✕
                                </button>
                            </div>
                        ) : null}

                        {scanResult && (
                            <div className={`p-8 rounded-2xl mb-6 w-full flex flex-col items-center justify-center aspect-square text-center shadow-inner ${scanResult.type === 'error'
                                    ? 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400'
                                    : scanResult.status === 'ENTER'
                                        ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800/50 dark:text-green-400'
                                        : 'bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800/50 dark:text-blue-400'
                                }`}>
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 bg-white/50 dark:bg-black/20 shadow-sm`}>
                                    <span className="text-4xl">
                                        {scanResult.type === 'error' ? '❌' : scanResult.status === 'ENTER' ? '👋' : '🏃‍♂️💨'}
                                    </span>
                                </div>
                                <h3 className="font-black text-xl leading-tight mb-3">{scanResult.message}</h3>
                                {scanResult.type === 'success' && (
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80 bg-white/40 dark:bg-black/20 px-3 py-1 rounded-full">
                                        Successfully Logged {scanResult.status}
                                    </p>
                                )}
                            </div>
                        )}

                        {!isScanningMode && !scanResult && (
                            <div className="w-full">
                                <button
                                    onClick={() => setIsScanningMode(true)}
                                    disabled={!user.isProfileComplete || !hasAnyActivePlan}
                                    className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 ${!user.isProfileComplete || !hasAnyActivePlan
                                            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed hidden'
                                            : 'bg-olive hover:bg-olive/90 text-white dark:bg-lightSage dark:text-darkBg dark:hover:bg-lightSage/90 hover:scale-[1.02]'
                                        }`}
                                >
                                    <span className="text-xl">📷</span> Enable Camera Scanner
                                </button>

                                {(!user.isProfileComplete || !hasAnyActivePlan) && (
                                    <button
                                        disabled
                                        className="w-full bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 font-bold py-4 rounded-xl cursor-not-allowed flex justify-center items-center gap-2"
                                    >
                                        <span className="text-xl">🔒</span> Scanner Locked
                                    </button>
                                )}

                                {!hasAnyActivePlan && user.isProfileComplete && (
                                    <p className="text-xs text-red-500 dark:text-red-400 font-bold mt-4">You need an active membership plan to access the facility scanner.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Active Subscriptions Display */}
                    <div className="bg-white dark:bg-darkCard rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col h-[280px]">
                        <h3 className="font-bold text-gray-900 dark:text-cream text-lg mb-4 flex items-center justify-between">
                            My Active Plans
                            <span className="text-olive dark:text-lightSage text-sm">💳</span>
                        </h3>

                        <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
                            {activeSubscriptions.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center">
                                    <span className="text-3xl mb-2 opacity-50">🛒</span>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">You have no active memberships.</p>
                                </div>
                            ) : (
                                activeSubscriptions.map(sub => (
                                    <div key={sub.planId} className="p-4 bg-gray-50 dark:bg-darkBg border border-gray-100 dark:border-gray-800 rounded-xl hover:border-olive/30 dark:hover:border-lightSage/30 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-sm text-gray-900 dark:text-cream leading-tight pr-2">{sub.planName}</span>
                                            <span className="text-[10px] uppercase font-black bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50 px-2.5 py-1 rounded-full whitespace-nowrap shadow-sm">
                                                Active
                                            </span>
                                        </div>
                                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 font-medium">
                                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                            Expires: {new Date(sub.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-center flex-shrink-0">
                            <Link to="/member/store" className="inline-flex items-center text-olive dark:text-lightSage text-sm font-bold hover:opacity-80 transition-opacity">
                                Buy or Upgrade Plans <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                            </Link>
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN: The Schedule */}
                <div className="lg:col-span-2 bg-white dark:bg-darkCard rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 md:p-8 flex flex-col h-full min-h-[600px]">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-olive/10 dark:bg-lightSage/10 flex items-center justify-center text-xl">🗓️</div>
                            <h3 className="font-bold text-xl text-gray-900 dark:text-cream tracking-tight">My Schedule This Week</h3>
                        </div>
                        <Link to="/member/calendar" className="bg-gray-50 hover:bg-gray-100 dark:bg-darkBg dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-2">
                            <span>Book Classes</span> <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                        </Link>
                    </div>

                    <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {upcomingClasses.length === 0 ? (
                            <div className="text-center py-20 bg-gray-50/50 dark:bg-darkBg/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 h-full flex flex-col items-center justify-center">
                                <div className="w-16 h-16 bg-white dark:bg-darkCard rounded-full flex items-center justify-center shadow-sm mb-4">
                                    <span className="text-2xl opacity-60">🧘‍♂️</span>
                                </div>
                                <p className="text-gray-900 dark:text-cream font-bold text-lg mb-1">No upcoming classes</p>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-xs">Your schedule is clear. Browse the calendar to discover and book new sessions.</p>
                                <Link to="/member/calendar" className="text-olive dark:text-lightSage font-bold hover:underline inline-flex items-center gap-1">
                                    Explore the calendar <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                </Link>
                            </div>
                        ) : (
                            upcomingClasses.map(cls => {
                                const startDate = new Date(cls.startTime);
                                const endDate = new Date(cls.endTime);
                                const timeStr = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    + " - " +
                                    endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                const isWaitlisted = cls.status === 'WAITLISTED';

                                return (
                                    <div key={cls.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-darkBg shadow-sm hover:shadow-md hover:border-olive/30 dark:hover:border-lightSage/30 transition-all group">
                                        <div className="flex items-start gap-5">

                                            {/* Date Badge */}
                                            <div className="bg-gray-50 dark:bg-darkCard border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-cream w-16 py-3 rounded-xl font-bold text-center leading-tight flex-shrink-0 group-hover:bg-olive group-hover:text-white dark:group-hover:bg-lightSage dark:group-hover:text-darkBg group-hover:border-transparent transition-colors">
                                                <div className="text-[10px] uppercase tracking-widest opacity-80 mb-0.5">{startDate.toLocaleString('default', { month: 'short' })}</div>
                                                <div className="text-2xl font-black">{startDate.getDate()}</div>
                                            </div>

                                            <div className="pt-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                                    <h4 className="font-black text-gray-900 dark:text-cream text-lg leading-tight truncate">{cls.name}</h4>
                                                    <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full border shadow-sm whitespace-nowrap ${isWaitlisted
                                                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50'
                                                            : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50'
                                                        }`}>
                                                        {isWaitlisted ? '⏳ Waitlisted' : '✅ Confirmed'}
                                                    </span>
                                                </div>

                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                                                    <p className="flex items-center gap-1.5">
                                                        <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                        {timeStr}
                                                    </p>
                                                    <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                                                    <p className="flex items-center gap-1.5 truncate">
                                                        <svg className="w-4 h-4 opacity-70 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                                        <span className="truncate">{cls.trainer}</span>
                                                    </p>
                                                    <div className="hidden sm:block w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                                                    <p className="flex items-center gap-1.5 truncate">
                                                        <svg className="w-4 h-4 opacity-70 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                                        <span className="truncate">{cls.room}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Global Keyframes for the scanner line animation */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes scanLine {
                    0% { transform: translateY(-90px); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateY(90px); opacity: 0; }
                }
                .animate-scan {
                    animation: scanLine 2s linear infinite;
                }
            `}} />
        </div>
    );
}
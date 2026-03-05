import { useState, useEffect, useRef } from 'react';
import api from '../api/axiosConfig';

export default function AdminCheckIn() {
    const [scannedId, setScannedId] = useState('');
    const [activeMembers, setActiveMembers] = useState([]);
    const [scanResult, setScanResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);

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
        inputRef.current?.focus(); // Keep focus on the scanner input
        return () => clearInterval(intervalId);
    }, []);

    // Ensures we keep focus on the invisible input to catch scanners
    const handleContainerClick = () => {
        inputRef.current?.focus();
    };

    const handleScanSubmit = async (e) => {
        e.preventDefault();
        if (!scannedId.trim()) return;

        setLoading(true);
        setScanResult(null);

        try {
            const res = await api.post('/api/checkin/scan', {
                userId: scannedId.trim()
            });

            setScanResult({
                type: 'success',
                message: res.data.message,
                status: res.data.status, // "ENTER" or "EXIT"
                user: res.data.user
            });

            // Clear input for next scan
            setScannedId('');

            // Refresh roster
            fetchActiveRoster();

        } catch (error) {
            setScanResult({
                type: 'error',
                message: error.response?.data?.error || "Processing failed.",
            });
            setScannedId('');
        } finally {
            setLoading(false);
            setTimeout(() => setScanResult(null), 4000); // Clear message after 4s
            inputRef.current?.focus();
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto h-full flex flex-col" onClick={handleContainerClick}>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Access Control</h1>
                    <p className="text-gray-500">Live facility roster & QR Code Check-in Scanner</p>
                </div>

                {/* The "Invisible" scanner input that hardware scanners write to automatically */}
                <form onSubmit={handleScanSubmit} className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={scannedId}
                        onChange={(e) => setScannedId(e.target.value)}
                        placeholder="Scan or type ID..."
                        className="px-4 py-3 min-w-[300px] border-2 border-dashed border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-mono text-sm shadow-sm"
                        disabled={loading}
                        autoFocus
                    />
                    {loading && (
                        <div className="absolute right-3 top-3 animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    )}
                </form>
            </div>

            {/* Scan Result Alert Banner */}
            <div className={`transition-all duration-300 overflow-hidden ${scanResult ? 'h-24 opacity-100 mb-6' : 'h-0 opacity-0 mb-0'}`}>
                {scanResult && (
                    <div className={`h-full p-6 rounded-2xl flex items-center justify-center space-x-4 shadow-sm border-2 ${scanResult.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                        scanResult.status === 'ENTER' ? 'bg-green-50 border-green-200 text-green-800' :
                            'bg-blue-50 border-blue-200 text-blue-800'
                        }`}>
                        <span className="text-4xl">
                            {scanResult.type === 'error' ? '❌' : scanResult.status === 'ENTER' ? '👋' : '🏃'}
                        </span>
                        <div>
                            <h3 className="font-extrabold text-2xl">{scanResult.message}</h3>
                            {scanResult.type === 'success' && <p className="text-sm opacity-80 uppercase tracking-widest font-bold">Successfully Logged {scanResult.status}</p>}
                        </div>
                    </div>
                )}
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

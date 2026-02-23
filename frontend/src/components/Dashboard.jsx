import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [status, setStatus] = useState('LOADING...');
    const [planName, setPlanName] = useState(''); // NEW STATE FOR PLAN NAME
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
        } else {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            fetchSubscriptionStatus(parsedUser.id);
        }
    }, [navigate]);

    const fetchSubscriptionStatus = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/subscriptions/status/${userId}`);
            setStatus(response.data.status);
            setPlanName(response.data.planName); // STORE THE PLAN NAME
        } catch (error) {
            console.error("Failed to fetch status", error);
            setStatus('NONE');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
                <span className="text-xl font-bold">Enterprise Gym</span>
                <button onClick={handleLogout} className="px-4 py-2 text-sm border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors">Logout</button>
            </nav>

            <div className="container mx-auto mt-10 px-4 flex justify-center">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-md w-full">
                    <div className="bg-blue-600 p-4 text-center">
                        <h3 className="text-white text-lg font-semibold">Digital Access Pass</h3>
                    </div>

                    <div className="p-8 text-center">
                        <h4 className="text-2xl font-bold text-gray-800 mb-6">Welcome, {user.firstName}!</h4>

                        {status === 'LOADING...' && <p className="text-gray-500">Loading your status...</p>}

                        {status === 'NONE' && (
                            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
                                <h2 className="text-xl font-bold mb-2">No Active Subscription</h2>
                                <p className="mb-4 text-sm">You need a membership plan to enter the gym.</p>
                                <Link to="/plans" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">Buy Subscription</Link>
                            </div>
                        )}

                        {status === 'GRACE_PERIOD' && (
                            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg mb-6 shadow-sm">
                                <h2 className="text-xl font-bold mb-2">Almost Expired!</h2>
                                <p className="mb-4 text-sm">Your {planName} plan expires in less than 5 days. Renew now.</p>
                                <Link to="/plans" className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">Renew Now</Link>
                            </div>
                        )}

                        {status === 'ACTIVE' && (
                            <div>
                                <div className="my-6 p-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex justify-center items-center h-32 relative">
                                    <p className="text-gray-400 font-mono">[ Barcode ]</p>
                                    {/* Display a shiny badge for their plan tier inside the pass! */}
                                    <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded shadow">
                                        {planName}
                                    </span>
                                </div>
                                <h2 className="text-3xl font-extrabold text-green-500 tracking-wider">ACTIVE</h2>
                                <p className="text-gray-500 mt-2 mb-6">{planName} Subscription Valid.</p>
                                <Link to="/plans" className="text-blue-600 hover:underline text-sm font-semibold">Upgrade Subscription</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
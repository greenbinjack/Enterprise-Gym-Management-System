import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminDashboard() {
    const [applications, setApplications] = useState({ PENDING: [], APPROVED: [], REJECTED: [] });
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Security Check & Initialization
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/admin/login');
            return;
        }

        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== 'ADMIN') {
            alert("Access Denied: You must be an Administrator to view this page.");
            navigate('/dashboard'); // Send regular members to their dashboard
            return;
        }

        setUser(parsedUser);
        fetchAllApplications();
    }, [navigate]);

    // Fetch the Kanban columns from the backend
    const fetchAllApplications = async () => {
        setIsLoading(true);
        try {
            const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
                axios.get('http://localhost:8080/api/recruitment/applications/PENDING'),
                axios.get('http://localhost:8080/api/recruitment/applications/APPROVED'),
                axios.get('http://localhost:8080/api/recruitment/applications/REJECTED')
            ]);

            setApplications({
                PENDING: pendingRes.data,
                APPROVED: approvedRes.data,
                REJECTED: rejectedRes.data
            });
        } catch (error) {
            console.error("Failed to fetch applications", error);
            alert("Failed to load recruitment data. Is the backend running?");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Approve / Reject actions
    const handleAction = async (id, action) => {
        const actionText = action === 'approve' ? 'Approve and Hire' : 'Reject';
        if (!window.confirm(`Are you sure you want to ${actionText} this applicant?`)) return;

        try {
            await axios.post(`http://localhost:8080/api/recruitment/applications/${id}/${action}`);
            fetchAllApplications(); // Refresh the board dynamically
        } catch (error) {
            alert("Error: " + (error.response?.data?.error || "Action failed"));
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/admin/login');
    };

    if (!user) return null; // Prevent flashing while checking auth

    // Reusable UI Component for Applicant Cards
    const ApplicantCard = ({ app, isPending }) => (
        <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow mb-4 border border-gray-200">
            <h4 className="font-bold text-lg text-gray-900">{app.firstName} {app.lastName}</h4>

            <div className="mt-3 space-y-2">
                <p className="text-sm text-gray-600 flex items-center">
                    <span className="mr-2">📧</span> {app.email}
                </p>
                <p className="text-sm text-gray-600 flex items-center">
                    <span className="mr-2">📞</span> {app.phone}
                </p>
            </div>

            <div className="mt-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Specialties</p>
                <p className="text-sm text-gray-700 bg-gray-50 border border-gray-100 p-2 rounded-md">
                    {app.specialties}
                </p>
            </div>

            <a
                href={app.cvUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-4 text-blue-600 hover:text-blue-800 text-sm font-semibold hover:underline"
            >
                📄 View Applicant CV
            </a>

            {isPending && (
                <div className="flex space-x-3 mt-5 pt-4 border-t border-gray-100">
                    <button
                        onClick={() => handleAction(app.id, 'approve')}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
                    >
                        Approve & Hire
                    </button>
                    <button
                        onClick={() => handleAction(app.id, 'reject')}
                        className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
                    >
                        Reject
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Admin Top Navigation */}
            <nav className="bg-gray-900 text-white px-8 py-4 flex justify-between items-center shadow-lg">
                <div className="flex items-center space-x-4">
                    <span className="text-2xl font-black tracking-tight text-white">System Admin</span>
                    <span className="bg-gray-700 text-xs px-2 py-1 rounded text-gray-300 font-mono">v1.0.0</span>
                </div>
                <div className="flex items-center space-x-6">
                    <span className="text-sm text-gray-300">Logged in as <span className="font-bold text-white">{user.firstName}</span></span>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors font-semibold"
                    >
                        Logout Session
                    </button>
                </div>
            </nav>

            {/* Dashboard Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Trainer Recruitment Pipeline</h1>
                        <p className="text-gray-500 mt-2 text-sm">Review, hire, or reject applicant submissions in real-time.</p>
                    </div>
                    {isLoading && <span className="text-blue-600 text-sm font-bold animate-pulse">Refreshing board...</span>}
                </div>

                {/* Kanban Board Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Column 1: PENDING */}
                    <div className="bg-gray-100/50 p-5 rounded-2xl min-h-[600px] border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
                            <h3 className="text-lg font-bold text-gray-800">Needs Review</h3>
                            <span className="bg-blue-600 text-white font-bold rounded-full px-3 py-1 text-xs shadow-sm">
                                {applications.PENDING.length}
                            </span>
                        </div>
                        <div className="space-y-4">
                            {applications.PENDING.length === 0 && !isLoading && <p className="text-gray-400 text-sm text-center italic py-4">No pending applications.</p>}
                            {applications.PENDING.map(app => <ApplicantCard key={app.id} app={app} isPending={true} />)}
                        </div>
                    </div>

                    {/* Column 2: APPROVED */}
                    <div className="bg-green-50/50 p-5 rounded-2xl min-h-[600px] border border-green-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6 border-b border-green-200 pb-3">
                            <h3 className="text-lg font-bold text-green-900">Hired Trainers</h3>
                            <span className="bg-green-600 text-white font-bold rounded-full px-3 py-1 text-xs shadow-sm">
                                {applications.APPROVED.length}
                            </span>
                        </div>
                        <div className="space-y-4">
                            {applications.APPROVED.length === 0 && !isLoading && <p className="text-green-600/50 text-sm text-center italic py-4">No hired trainers yet.</p>}
                            {applications.APPROVED.map(app => <ApplicantCard key={app.id} app={app} isPending={false} />)}
                        </div>
                    </div>

                    {/* Column 3: REJECTED */}
                    <div className="bg-red-50/50 p-5 rounded-2xl min-h-[600px] border border-red-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6 border-b border-red-200 pb-3">
                            <h3 className="text-lg font-bold text-red-900">Rejected</h3>
                            <span className="bg-red-600 text-white font-bold rounded-full px-3 py-1 text-xs shadow-sm">
                                {applications.REJECTED.length}
                            </span>
                        </div>
                        <div className="space-y-4">
                            {applications.REJECTED.length === 0 && !isLoading && <p className="text-red-600/50 text-sm text-center italic py-4">No rejected applications.</p>}
                            {applications.REJECTED.map(app => <ApplicantCard key={app.id} app={app} isPending={false} />)}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
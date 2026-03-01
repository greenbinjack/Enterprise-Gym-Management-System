import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function AdminRecruitmentBoard() {
    const [board, setBoard] = useState({ needsReview: [], hired: [], rejected: [], fired: [] });
    const [isLoading, setIsLoading] = useState(true);

    const fetchBoard = async () => {
        try {
            const response = await api.get('/api/recruitment/board');
            setBoard(response.data);
        } catch (error) {
            console.error("Failed to load recruitment board", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBoard();
    }, []);

    // Action: Move Pending -> Rejected OR Rejected -> Pending
    const handleApplicationAction = async (id, action) => {
        try {
            await api.post(`/api/recruitment/applications/${id}/${action}`);
            fetchBoard();
        } catch (error) { alert("Failed to move application."); }
    };

    // Action: Fire or Rehire Trainer (Re-using the global Admin user endpoint)
    const handleToggleTrainerAccess = async (userId, makeActive) => {
        const msg = makeActive ? "Restore this trainer's access and rehire them?" : "Fire this trainer and revoke system access immediately?";
        if (!window.confirm(msg)) return;
        try {
            await api.put(`/api/admin/users/${userId}/toggle-status`, { isActive: makeActive });
            fetchBoard();
        } catch (error) { alert("Failed to change trainer status."); }
    };

    if (isLoading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

    return (
        <div className="p-8 min-h-screen bg-gray-50 overflow-x-auto">
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900">Trainer Recruitment Board</h2>
                <p className="text-gray-500 mt-1">Manage applications, active staff, and terminated contracts.</p>
            </div>

            <div className="flex gap-6 min-w-max pb-8">

                {/* 1. Needs Review */}
                <div className="w-80 bg-gray-100 rounded-xl border border-gray-200 p-4 h-fit">
                    <h3 className="font-bold text-gray-700 uppercase tracking-wider text-sm mb-4">📝 Needs Review ({board.needsReview.length})</h3>
                    {board.needsReview.map(app => (
                        <div key={app.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-3 border-l-4 border-l-yellow-400">
                            <h4 className="font-bold text-gray-900">{app.firstName} {app.lastName}</h4>
                            <p className="text-xs text-gray-500 mb-1">{app.email}</p>
                            <a href={app.cvUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline mb-2 block">📄 View CV</a>
                            <p className="text-xs font-medium text-gray-700 bg-gray-50 p-2 rounded mb-3">{app.specialties}</p>
                            <div className="flex space-x-2">
                                <button onClick={() => handleApplicationAction(app.id, 'approve')} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 rounded">Hire</button>
                                <button onClick={() => handleApplicationAction(app.id, 'reject')} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold py-2 rounded">Reject</button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 2. Hired Trainers */}
                <div className="w-80 bg-blue-50 rounded-xl border border-blue-200 p-4 h-fit">
                    <h3 className="font-bold text-blue-800 uppercase tracking-wider text-sm mb-4">✅ Active Staff ({board.hired.length})</h3>
                    {board.hired.map(user => (
                        <div key={user.id} className="bg-white p-4 rounded-lg shadow-sm border border-blue-200 mb-3 border-l-4 border-l-blue-500">
                            <h4 className="font-bold text-gray-900">{user.firstName} {user.lastName}</h4>
                            <p className="text-xs text-gray-500 mb-3">{user.email}</p>
                            <button onClick={() => handleToggleTrainerAccess(user.id, false)} className="w-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold py-2 rounded">
                                🔥 Fire Trainer
                            </button>
                        </div>
                    ))}
                </div>

                {/* 3. Rejected Applications */}
                <div className="w-80 bg-gray-100 rounded-xl border border-gray-200 p-4 h-fit">
                    <h3 className="font-bold text-gray-500 uppercase tracking-wider text-sm mb-4">❌ Rejected ({board.rejected.length})</h3>
                    {board.rejected.map(app => (
                        <div key={app.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-3 opacity-75">
                            <h4 className="font-bold text-gray-700">{app.firstName} {app.lastName}</h4>
                            <p className="text-xs text-gray-500 mb-3">{app.email}</p>
                            <button onClick={() => handleApplicationAction(app.id, 'pending')} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2 rounded">
                                ⏪ Move to Review
                            </button>
                        </div>
                    ))}
                </div>

                {/* 4. Fired Trainers */}
                <div className="w-80 bg-red-50 rounded-xl border border-red-200 p-4 h-fit">
                    <h3 className="font-bold text-red-800 uppercase tracking-wider text-sm mb-4">🚫 Fired Trainers ({board.fired.length})</h3>
                    {board.fired.map(user => (
                        <div key={user.id} className="bg-white p-4 rounded-lg shadow-sm border border-red-200 mb-3 border-l-4 border-l-red-500">
                            <h4 className="font-bold text-gray-900 line-through">{user.firstName} {user.lastName}</h4>
                            <p className="text-xs text-gray-500 mb-3">Access Revoked</p>
                            <button onClick={() => handleToggleTrainerAccess(user.id, true)} className="w-full bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 text-xs font-bold py-2 rounded">
                                🤝 Rehire Trainer
                            </button>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
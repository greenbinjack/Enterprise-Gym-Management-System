import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/api/admin/users');
            setUsers(response.data);
        } catch (error) {
            console.error("Failed to load users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const isCurrentlyBanned = currentStatus === 'BANNED';
        const confirmMsg = isCurrentlyBanned
            ? "Restore access for this user?"
            : "Ban this user? They will be immediately locked out of their account.";

        if (!window.confirm(confirmMsg)) return;

        try {
            // If they are banned, we send true (make active). If they are active/inactive, we send false (ban them).
            await api.put(`/api/admin/users/${id}/toggle-status`, {
                isActive: isCurrentlyBanned
            });
            fetchUsers(); // Refresh the board
        } catch (error) {
            alert(error.response?.data?.error || "Action failed.");
        }
    };

    // Filter users into the 3 categories
    const activeMembers = users.filter(u => u.adminStatus === 'ACTIVE');
    const inactiveMembers = users.filter(u => u.adminStatus === 'INACTIVE');
    const bannedMembers = users.filter(u => u.adminStatus === 'BANNED');

    // Reusable Card Component
    const UserCard = ({ user }) => (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-3 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-gray-900">{user.firstName} {user.lastName}</h4>
                <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider ${user.role === 'TRAINER' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                    {user.role}
                </span>
            </div>
            <p className="text-xs text-gray-500 mb-4">{user.email}</p>

            <button
                onClick={() => handleToggleStatus(user.id, user.adminStatus)}
                className={`w-full py-2 text-xs font-bold rounded transition-colors ${user.adminStatus === 'BANNED'
                    ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                    : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                    }`}
            >
                {user.adminStatus === 'BANNED' ? '✅ Unban Member' : '🚫 Ban Member'}
            </button>
        </div>
    );

    if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

    return (
        <div className="p-8 min-h-screen bg-gray-50">
            <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900">User Directory</h2>
                <p className="text-gray-500 mt-1">Manage active subscriptions, unpaid leads, and security bans.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Column 1: Active Members */}
                <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 h-fit">
                    <div className="flex justify-between items-center mb-4 px-2">
                        <h3 className="font-bold text-gray-700 uppercase tracking-wider text-sm">🟢 Active Subscriptions</h3>
                        <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded-full">{activeMembers.length}</span>
                    </div>
                    <div>
                        {activeMembers.length === 0 && <p className="text-sm text-gray-500 italic text-center py-4">No active members.</p>}
                        {activeMembers.map(user => <UserCard key={user.id} user={user} />)}
                    </div>
                </div>

                {/* Column 2: Inactive Members */}
                <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 h-fit">
                    <div className="flex justify-between items-center mb-4 px-2">
                        <h3 className="font-bold text-gray-700 uppercase tracking-wider text-sm">🟡 Inactive / Unpaid</h3>
                        <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded-full">{inactiveMembers.length}</span>
                    </div>
                    <div>
                        {inactiveMembers.length === 0 && <p className="text-sm text-gray-500 italic text-center py-4">No inactive accounts.</p>}
                        {inactiveMembers.map(user => <UserCard key={user.id} user={user} />)}
                    </div>
                </div>

                {/* Column 3: Banned Members */}
                <div className="bg-red-50 p-4 rounded-xl border border-red-200 h-fit">
                    <div className="flex justify-between items-center mb-4 px-2">
                        <h3 className="font-bold text-red-800 uppercase tracking-wider text-sm">🔴 Banned</h3>
                        <span className="bg-red-200 text-red-800 text-xs font-bold px-2 py-1 rounded-full">{bannedMembers.length}</span>
                    </div>
                    <div>
                        {bannedMembers.length === 0 && <p className="text-sm text-red-400 italic text-center py-4">No banned users.</p>}
                        {bannedMembers.map(user => <UserCard key={user.id} user={user} />)}
                    </div>
                </div>

            </div>
        </div>
    );
}
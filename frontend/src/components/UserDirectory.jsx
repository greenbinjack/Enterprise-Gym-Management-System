import { useState, useEffect } from 'react';
import axios from 'axios';

export default function UserDirectory() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const fetchUsers = async (query = '') => {
        try {
            const res = await axios.get(`http://localhost:8080/api/staff/directory?search=${encodeURIComponent(query)}`);
            setUsers(res.data || []);
        } catch (err) {
            console.error('Failed to fetch directory:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSearch = (e) => {
        const val = e.target.value;
        setSearch(val);
        fetchUsers(val);
    };

    const getRoleBadge = (role) => {
        const styles = {
            MEMBER: 'bg-blue-500/20 text-blue-400',
            TRAINER: 'bg-purple-500/20 text-purple-400',
            STAFF: 'bg-green-500/20 text-green-400',
            ADMIN: 'bg-red-500/20 text-red-400',
        };
        return styles[role] || 'bg-slate-500/20 text-slate-400';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-white">
                    User <span className="text-green-400">Directory</span>
                </h1>
                <p className="text-slate-400 mt-1">Search and view gym members, trainers, and staff. Read-only access.</p>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">🔍</span>
                    <input
                        type="text"
                        placeholder="Search by name..."
                        value={search}
                        onChange={handleSearch}
                        className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-green-500 transition-colors"
                    />
                </div>
            </div>

            {/* Results */}
            {isLoading ? (
                <div className="flex items-center justify-center py-24">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-400"></div>
                </div>
            ) : users.length === 0 ? (
                <div className="text-center py-24">
                    <span className="text-6xl">🕵️</span>
                    <p className="text-slate-400 font-bold mt-4 text-lg">No users found</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {users.map((u) => (
                        <div
                            key={u.id}
                            className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 flex flex-col items-center text-center hover:border-green-500/50 transition-all"
                        >
                            {/* Avatar */}
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-700 mb-3 flex-shrink-0">
                                {u.photoUrl ? (
                                    <img
                                        src={u.photoUrl}
                                        alt={u.firstName}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl font-black text-green-400">
                                        {u.firstName?.[0] || '?'}
                                    </div>
                                )}
                            </div>

                            <p className="text-white font-bold text-sm leading-tight">
                                {u.firstName} {u.lastName}
                            </p>
                            <span className={`mt-2 text-xs font-bold px-2 py-0.5 rounded-full uppercase ${getRoleBadge(u.role)}`}>
                                {u.role}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            <p className="text-slate-600 text-xs text-center mt-8">
                {users.length} record{users.length !== 1 ? 's' : ''} shown • Staff have read-only access
            </p>
        </div>
    );
}

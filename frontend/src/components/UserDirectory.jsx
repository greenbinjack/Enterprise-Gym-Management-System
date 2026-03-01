import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function UserDirectory() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const fetchUsers = async (query = '') => {
        setIsLoading(true);
        try {
            const res = await api.get(`/api/staff/directory?search=${encodeURIComponent(query)}`);
            setUsers(res.data || []);
        } catch (err) {
            console.error('Failed to fetch directory:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchUsers(search);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [search]);

    const getRoleBadge = (role) => {
        const styles = {
            MEMBER: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
            TRAINER: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
            STAFF: 'bg-olive/10 dark:bg-lightSage/20 text-olive dark:text-lightSage border-olive/20 dark:border-lightSage/30',
            ADMIN: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
        };
        return styles[role] || 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700';
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto h-full overflow-y-auto">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-cream tracking-tight">
                    User <span className="text-olive dark:text-lightSage">Directory</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Search and view gym members, trainers, and staff. Read-only access.</p>
            </div>

            {/* Search Bar */}
            <div className="mb-8 max-w-2xl relative">
                <div className="relative group shadow-sm transition-shadow hover:shadow-md rounded-2xl">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-xl transition-colors group-hover:text-olive dark:group-hover:text-lightSage">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Search by name, email, or role..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white dark:bg-darkCard border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-cream placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-olive dark:focus:ring-lightSage transition-all"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Results */}
            {isLoading && users.length === 0 ? (
                <div className="flex items-center justify-center py-24">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-olive dark:border-lightSage"></div>
                </div>
            ) : users.length === 0 ? (
                <div className="text-center py-24 bg-white dark:bg-darkCard rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="inline-block p-6 rounded-full bg-gray-50 dark:bg-darkBg mb-4">
                        <span className="text-5xl">🕵️‍♂️</span>
                    </div>
                    <p className="text-gray-900 dark:text-cream text-xl font-black tracking-tight mb-2">No users found</p>
                    <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {users.map((u) => (
                            <div
                                key={u.id}
                                className="bg-white dark:bg-darkCard border border-gray-100 dark:border-gray-800 rounded-3xl p-5 flex flex-col items-center text-center hover:shadow-lg hover:border-olive/30 dark:hover:border-lightSage/30 transition-all group"
                            >
                                {/* Avatar */}
                                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-50 dark:bg-darkBg mb-4 flex-shrink-0 border-2 border-transparent group-hover:border-olive/30 dark:group-hover:border-lightSage/30 transition-colors shadow-sm">
                                    {u.photoUrl ? (
                                        <img
                                            src={u.photoUrl}
                                            alt={u.firstName}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl font-black text-olive dark:text-lightSage bg-olive/5 dark:bg-lightSage/5">
                                            {u.firstName?.[0] || '?'}
                                        </div>
                                    )}
                                </div>

                                <div className="w-full min-w-0">
                                    <p className="text-gray-900 dark:text-cream font-bold text-sm leading-tight truncate px-2 mb-1" title={`${u.firstName} ${u.lastName}`}>
                                        {u.firstName} {u.lastName}
                                    </p>
                                    <p className="text-gray-400 dark:text-gray-500 text-[10px] truncate px-2 mb-3" title={u.email}>
                                        {u.email}
                                    </p>
                                </div>

                                <span className={`mt-auto text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border transition-colors ${getRoleBadge(u.role)}`}>
                                    {u.role}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 flex items-center justify-between pb-4">
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                            Showing <span className="font-bold text-gray-900 dark:text-cream">{users.length}</span> record{users.length !== 1 ? 's' : ''}
                        </p>
                        <p className="text-gray-400 dark:text-gray-500 text-xs flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Staff have read-only access
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}

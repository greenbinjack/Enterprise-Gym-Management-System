import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

export default function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/admin/login');
    };

    const navItems = [
        { path: '/admin/dashboard', label: 'Command Center', icon: '📊' },
        { path: '/admin/schedule-builder', label: 'Master Schedule', icon: '📅' },
        { path: '/admin/facilities', label: 'Facility Config', icon: '🏢' },
        { path: '/admin/users', label: 'User Directory', icon: '👥' },
        { path: '/admin/recruitment', label: 'Recruitment Board', icon: '📋' },
        { path: '/admin/inventory', label: 'Inventory', icon: '🛒' },
    ];

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Persistent Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-xl font-black tracking-tight text-white">
                        ENTERPRISE<span className="text-blue-500">GYM</span>
                    </h1>
                    <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Admin Portal</p>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname.includes(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <span className="mr-3 text-lg">{item.icon}</span>
                                <span className="font-medium text-sm">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                        <span className="mr-3">🚪</span> Logout
                    </button>
                </div>
            </aside>

            {/* Dynamic Content Area */}
            <main className="flex-1 overflow-y-auto">
                {/* The <Outlet /> renders whatever sub-page is currently active in the router */}
                <Outlet />
            </main>
        </div>
    );
}
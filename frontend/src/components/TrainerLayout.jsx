import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';

export default function TrainerLayout() {
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { path: '/trainer/dashboard', label: 'My Dashboard', icon: '🗓️' },
        { path: '/trainer/schedule', label: 'Manage Schedule', icon: '🕒' },
        { path: '/trainer/profile', label: 'Profile Settings', icon: '🧑‍🏫' }
    ];

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Persistent Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl hidden md:flex">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-xl font-black tracking-tight text-white">
                        ENTERPRISE<span className="text-blue-500">FIT</span>
                    </h1>
                    <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Trainer Portal</p>
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
                    <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-2 p-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg font-bold transition-colors">
                        <span>🚪</span><span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto w-full">
                <Outlet />
            </main>
        </div>
    );
}

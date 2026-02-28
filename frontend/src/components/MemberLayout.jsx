import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';

export default function MemberLayout() {
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { path: '/member/dashboard', label: 'My Dashboard', icon: '🏠' },
        { path: '/member/profile', label: 'Profile Settings', icon: '👤' },
        { path: '/member/store', label: 'Buy Memberships', icon: '💳' },
        { path: '/member/calendar', label: 'Class Calendar', icon: '📅' }
    ];

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white flex flex-col hidden md:flex">
                <div className="p-6 text-2xl font-black tracking-tighter text-blue-500 border-b border-gray-800">
                    ENTERPRISE<span className="text-white">FIT</span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map(item => {
                        const active = location.pathname.includes(item.path);
                        return (
                            <Link key={item.path} to={item.path} className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${active ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                                <span>{item.icon}</span>
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-gray-800">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-2 p-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg font-bold transition-colors">
                        <span>🚪</span><span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}
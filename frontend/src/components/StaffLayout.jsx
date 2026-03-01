import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function StaffLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const updateName = () => {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user?.firstName) {
                setUserName(user.firstName);
            }
        };
        updateName();
        window.addEventListener('storage', updateName);
        return () => window.removeEventListener('storage', updateName);
    }, []);

    const navItems = [
        { path: '/staff/dashboard', label: 'Live Dashboard', icon: '📊' },
        { path: '/staff/directory', label: 'User Directory', icon: '🧑‍🤝‍🧑' },
        { path: '/staff/equipment', label: 'Equipment', icon: '🏋️' },
        { path: '/staff/profile', label: 'Profile Settings', icon: '👤' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        navigate('/');
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-darkBg transition-colors font-sans overflow-hidden">

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-slate-900 border-b border-slate-800 z-50 px-4 py-3 flex justify-between items-center shadow-lg">
                <h1 className="text-lg font-black tracking-tight text-white">
                    ENTERPRISE<span className="text-olive">GYM</span>
                </h1>
                <div className="flex items-center gap-4">
                    <button onClick={toggleTheme} className="text-lg" aria-label="Toggle Theme">
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-white hover:text-olive transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMobileMenuOpen
                                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                            }
                        </svg>
                    </button>
                </div>
            </div>

            {/* Sidebar (Desktop Persistent, Mobile Overlay) */}
            <aside className={`fixed md:relative z-40 w-64 h-full bg-slate-900 text-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="hidden md:flex p-6 border-b border-slate-800 justify-between items-center">
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-white">
                            ENTERPRISE<span className="text-olive">GYM</span>
                        </h1>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">Staff Portal</p>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-slate-800 transition-colors text-sm"
                        aria-label="Toggle Theme"
                    >
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                </div>

                {/* Mobile Spacing */}
                <div className="md:hidden h-16 border-b border-slate-800"></div>

                {/* Staff Info display */}
                <div className="px-6 py-4 flex items-center gap-3 border-b border-slate-800/50 bg-slate-800/20">
                    <div className="w-8 h-8 rounded-full bg-olive text-white flex items-center justify-center font-black shadow-sm text-xs">
                        {userName ? userName[0] : 'S'}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white truncate max-w-[130px]">{userName || 'Staff Member'}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">On Shift</span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const isActive = location.pathname.includes(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-olive text-darkBg font-bold shadow-lg shadow-olive/20'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white font-medium'
                                    }`}
                            >
                                <span className={`mr-3 text-lg ${isActive ? 'opacity-100' : 'opacity-80'}`}>{item.icon}</span>
                                <span className="text-sm">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center px-4 py-3 font-bold text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors"
                    >
                        <span className="mr-3">🚪</span> Logout
                    </button>
                </div>
            </aside>

            {/* Mobile Overlay Background */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}

            {/* Dynamic Content Area */}
            <main className="flex-1 overflow-y-auto pt-16 md:pt-0 bg-gray-50 dark:bg-darkBg transition-colors relative">
                {/* Decorative Background Blob to make content feel premium */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-olive/5 dark:bg-olive/10 rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-lightSage/5 dark:bg-lightSage/5 rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none"></div>
                <div className="relative z-10 w-full h-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

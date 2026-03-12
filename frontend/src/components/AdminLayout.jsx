import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        navigate('/');
    };

    const navItems = [
        { path: '/admin/dashboard', label: 'Command Center', icon: '📊' },
        { path: '/admin/schedule-builder', label: 'Master Schedule', icon: '📅' },
        { path: '/admin/facilities', label: 'Facility Config', icon: '🏢' },
        { path: '/admin/users', label: 'Member Directory', icon: '👥' },
        { path: '/admin/checkins', label: 'Access Control', icon: '🎫' },
        { path: '/admin/recruitment', label: 'Trainer Directory', icon: '📋' },
        { path: '/admin/inventory', label: 'Inventory', icon: '🛒' },
        { path: '/admin/staff', label: 'Manage Staff', icon: '🧑‍💼' },
    ];

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-darkBg transition-colors font-sans overflow-hidden text-gray-900 dark:text-cream">

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-slate-900 dark:bg-darkCard border-b border-slate-800 dark:border-gray-800 z-50 px-4 py-3 flex justify-between items-center shadow-sm">
                <h1 className="text-xl font-black tracking-tight text-white">
                    VORTEX
                </h1>
                <div className="flex items-center gap-3">
                    <button onClick={toggleTheme} className="p-2 bg-slate-800 dark:bg-darkBg text-white rounded-full text-lg shadow-sm" aria-label="Toggle Theme">
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-slate-300 dark:text-gray-300 hover:text-white dark:hover:text-lightSage transition-colors p-2 bg-slate-800 dark:bg-darkBg rounded-full"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMobileMenuOpen
                                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                            }
                        </svg>
                    </button>
                </div>
            </div>

            {/* Sidebar (Desktop Persistent, Mobile Overlay) */}
            <aside className={`fixed md:relative z-40 w-72 h-full bg-slate-900 dark:bg-darkCard border-r border-slate-800 dark:border-gray-800 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="hidden md:flex flex-col p-6 border-b border-slate-800 dark:border-gray-800">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-black tracking-tighter text-white">
                            VORTEX
                        </h1>
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-slate-800 dark:hover:bg-darkBg transition-colors shadow-sm text-sm text-white"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'light' ? '🌙' : '☀️'}
                        </button>
                    </div>
                    <div className="mt-2 inline-flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <p className="text-[10px] text-slate-400 dark:text-gray-400 uppercase tracking-widest font-extrabold flex-1">Admin Operations</p>
                    </div>
                </div>

                {/* Mobile Spacing */}
                <div className="md:hidden h-[72px] border-b border-slate-800 dark:border-gray-800 bg-slate-900 dark:bg-darkCard"></div>

                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const isActive = location.pathname.includes(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center px-4 py-3.5 rounded-2xl transition-all duration-200 group ${isActive
                                    ? 'bg-olive dark:bg-lightSage/10 text-slate-900 dark:text-lightSage font-bold shadow-sm'
                                    : 'text-slate-300 dark:text-gray-400 hover:bg-slate-800 dark:hover:bg-darkBg hover:text-white dark:hover:text-cream font-medium'
                                    }`}
                            >
                                <span className={`mr-4 text-xl group-hover:scale-110 transition-transform ${isActive ? 'opacity-100' : 'opacity-75 grayscale group-hover:grayscale-0'}`}>{item.icon}</span>
                                <span className="text-sm tracking-wide">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800 dark:border-gray-800 bg-slate-800/50 dark:bg-darkBg/50 relative z-20">

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center px-4 py-3 text-sm font-bold text-red-400 hover:text-red-300 bg-red-900/20 hover:bg-red-900/40 rounded-xl transition-colors"
                    >
                        <span className="mr-3 text-lg opacity-80">🚪</span> Secure Logout
                    </button>
                </div>
            </aside>

            {/* Mobile Overlay Background */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>
            )}

            {/* Dynamic Content Area */}
            <main className="flex-1 overflow-y-auto pt-16 md:pt-0 bg-gray-50/50 dark:bg-darkBg relative transition-colors">
                {/* Decorative Background Blur Elements */}
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-olive/5 dark:bg-lightSage/5 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 pointer-events-none"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-100/30 dark:bg-blue-900/10 rounded-full mix-blend-multiply filter blur-[120px] opacity-60 pointer-events-none"></div>
                
                <div className="relative z-10 w-full h-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
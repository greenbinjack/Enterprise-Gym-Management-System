import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const [scrolled, setScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navClass = `fixed top-0 w-full z-50 transition-all duration-300 ${scrolled
        ? 'bg-cream/95 dark:bg-darkBg/95 backdrop-blur-lg shadow-md border-b border-lightSage/20 dark:border-darkCard py-3'
        : 'bg-transparent py-5'
        } px-6 md:px-12 flex justify-between items-center`;

    return (
        <nav className={navClass}>
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-olive to-brown dark:from-lightSage dark:to-olive flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform overflow-hidden">
                    <img src="/vortex-logo.png" alt="Vortex Logo" className="w-full h-full object-cover" />
                </div>
                <div className="text-xl md:text-2xl font-black tracking-tighter text-gray-900 dark:text-cream">
                    VORTEX
                </div>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
                <Link to="/about" className="text-gray-600 dark:text-gray-300 hover:text-olive dark:hover:text-lightSage font-bold transition-colors">About Us</Link>
                <Link to="/plans" className="text-gray-600 dark:text-gray-300 hover:text-olive dark:hover:text-lightSage font-bold transition-colors">Memberships</Link>
                <Link to="/careers" className="text-gray-600 dark:text-gray-300 hover:text-olive dark:hover:text-lightSage font-bold transition-colors">Careers</Link>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-2"></div>

                <Link to="/login" className="text-gray-900 dark:text-cream hover:text-olive dark:hover:text-lightSage font-black transition-colors">Sign In</Link>

                <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-full bg-white dark:bg-darkCard hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm border border-gray-200 dark:border-gray-700 text-lg hover:rotate-12"
                    aria-label="Toggle Theme"
                >
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>

                <Link to="/register" className="px-6 py-2.5 bg-gray-900 text-white dark:bg-cream dark:text-darkBg font-black rounded-xl shadow-lg hover:shadow-xl hover:bg-black dark:hover:bg-white transform hover:-translate-y-0.5 transition-all">
                    Join Now
                </Link>
            </div>

            {/* Mobile Menu Button  */}
            <div className="md:hidden flex items-center gap-4">
                <button onClick={toggleTheme} className="text-2xl p-2 rounded-full bg-white dark:bg-darkCard shadow-sm" aria-label="Toggle Theme">
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-gray-900 dark:text-cream hover:text-olive dark:hover:text-lightSage transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-olive rounded-md"
                    aria-label="Toggle Mobile Menu"
                >
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {isMobileMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Dropdown Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-cream dark:bg-darkBg shadow-xl border-t border-gray-200 dark:border-gray-800 transition-all duration-300">
                    <div className="flex flex-col py-4 px-6 space-y-4 shadow-inner">
                        <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-gray-800 dark:text-gray-200 hover:text-olive dark:hover:text-lightSage font-bold transition-colors py-2 border-b border-gray-100 dark:border-gray-800">About Us</Link>
                        <Link to="/plans" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-gray-800 dark:text-gray-200 hover:text-olive dark:hover:text-lightSage font-bold transition-colors py-2 border-b border-gray-100 dark:border-gray-800">Memberships</Link>
                        <Link to="/careers" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-gray-800 dark:text-gray-200 hover:text-olive dark:hover:text-lightSage font-bold transition-colors py-2 border-b border-gray-100 dark:border-gray-800">Careers</Link>

                        <div className="pt-4 flex flex-col space-y-4">
                            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center py-3 text-gray-900 dark:text-cream border-2 border-gray-900 dark:border-cream rounded-xl font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Sign In</Link>
                            <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center py-3 bg-gray-900 text-white dark:bg-cream dark:text-darkBg font-black rounded-xl shadow-lg hover:shadow-xl transition-all">Join Now</Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}

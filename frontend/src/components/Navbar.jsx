import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const [scrolled, setScrolled] = useState(false);

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
            <Link to="/" className="flex items-center gap-3 group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-olive to-brown dark:from-lightSage dark:to-olive flex items-center justify-center text-white dark:text-darkBg font-black text-2xl shadow-lg transform group-hover:scale-105 transition-transform">
                    E
                </div>
                <div className="text-xl md:text-2xl font-black tracking-tighter text-gray-900 dark:text-cream">
                    ENTERPRISE<span className="text-olive dark:text-lightSage">GYM</span>
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
                <button onClick={toggleTheme} className="text-2xl p-2 rounded-full bg-white dark:bg-darkCard shadow-sm">
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>
                <Link to="/login" className="px-5 py-2 bg-gray-900 text-white dark:bg-cream dark:text-darkBg rounded-lg font-bold">Sign In</Link>
            </div>
        </nav>
    );
}

import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function PublicLayout() {
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userId');
            window.dispatchEvent(new Event('storage'));
        }
    }, [location.pathname]);

    return (
        <div className="flex flex-col min-h-screen bg-cream dark:bg-darkBg transition-colors selection:bg-olive selection:text-white dark:selection:bg-lightSage dark:selection:text-darkBg">
            <Navbar />
            <main className="flex-1 flex flex-col">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}

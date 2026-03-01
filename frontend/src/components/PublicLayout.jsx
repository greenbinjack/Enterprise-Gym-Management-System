import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function PublicLayout() {
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

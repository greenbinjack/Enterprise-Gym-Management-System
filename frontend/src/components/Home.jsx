import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Top Navigation Bar */}
            <nav className="bg-white shadow-sm py-4 px-8 flex justify-between items-center">
                <div className="text-2xl font-black tracking-tighter text-blue-900">
                    ENTERPRISE<span className="text-blue-600">GYM</span>
                </div>
                <div className="space-x-6">
                    <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Member Login</Link>
                    <Link to="/careers" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Careers</Link>
                    <Link to="/admin/login" className="text-sm px-3 py-1 bg-gray-100 text-gray-500 rounded hover:bg-gray-200 transition-colors">Admin</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="flex-grow flex flex-col items-center justify-center px-4 text-center">
                <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
                    Elevate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Fitness Journey</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl">
                    Experience state-of-the-art facilities, elite trainers, and a community dedicated to your success. Your transformation starts right here.
                </p>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                    <Link
                        to="/register"
                        className="px-8 py-4 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                        Join the Gym Today
                    </Link>
                    <Link
                        to="/plans"
                        className="px-8 py-4 bg-white text-blue-600 font-bold rounded-full shadow border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                    >
                        View Memberships
                    </Link>
                </div>

                {/* Secondary Call to Action for Trainers */}
                <div className="mt-16 pt-8 border-t border-gray-200 w-full max-w-lg">
                    <p className="text-gray-500 mb-3 text-sm font-medium uppercase tracking-wider">Are you a fitness professional?</p>
                    <Link
                        to="/careers"
                        className="inline-flex items-center text-blue-600 font-bold hover:text-blue-800 transition-colors"
                    >
                        Apply to become a Trainer
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </Link>
                </div>
            </div>
        </div>
    );
}
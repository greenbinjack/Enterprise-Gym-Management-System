import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div className="flex flex-col justify-center items-center min-h-screen text-center bg-gray-900 text-white px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Enterprise Gym</h1>
            <p className="text-xl text-gray-300 mb-10">100% Self-Service. No lines. Just results. [cite: 14]</p>
            <div className="flex space-x-4">
                <Link to="/login" className="px-8 py-3 rounded-lg border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors text-lg font-semibold">Login</Link>
                <Link to="/register" className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors text-lg font-semibold shadow-lg">Join Now</Link>
            </div>
        </div>
    );
}
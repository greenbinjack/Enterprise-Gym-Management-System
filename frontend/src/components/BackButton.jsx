import { useNavigate } from 'react-router-dom';

export default function BackButton() {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate(-1)}
            className="group flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 mb-6 transition-colors duration-200"
        >
            <svg
                className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Go Back
        </button>
    );
}
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
    const [isAuthorized, setIsAuthorized] = useState(null);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('token');
            const role = localStorage.getItem('userRole');

            if (!token || !role) {
                setIsAuthorized(false);
            } else if (allowedRoles.includes(role)) {
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
            }
            setIsChecking(false);
        };

        checkAuth();
    }, [allowedRoles]);

    if (isChecking) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // If not authorized for this specific role, redirect to a standard /login page which handles 
    // further redirects based on their actual role if they try to log in again. 
    // This prevents members from seeing admin pages and vice versa.
    if (!isAuthorized) {
        const role = localStorage.getItem('userRole');
        if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
        if (role === 'TRAINER') return <Navigate to="/trainer/dashboard" replace />;
        if (role === 'MEMBER') return <Navigate to="/member/dashboard" replace />;
        if (role === 'STAFF') return <Navigate to="/staff/dashboard" replace />;
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;

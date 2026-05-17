import { Navigate } from 'react-router';
import { useAuth } from '../providers/AuthContext';
import type { ReactNode } from 'react';

interface Props {
    children: ReactNode;
    allowedRoles?: ('student' | 'creator')[];
}

function ProtectedRoute({ children, allowedRoles }: Props) {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" />
    }

    return (
        <>
            {children}
        </>
    )
}

export default ProtectedRoute
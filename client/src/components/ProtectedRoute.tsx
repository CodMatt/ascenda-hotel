//idk what routes we need to protect so its gonna just go in without implementing first 
import React from 'react';
import type {ReactNode} from 'react';
import {Navigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';

interface ProtectedRouteProps{
    children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({children}) =>{
    const {user, loading} = useAuth();

    if (loading){
        return <div>Loading...</div>
    }
    return user? <>{children}</>: <Navigate to="/login" replace />;
};

export default ProtectedRoute;

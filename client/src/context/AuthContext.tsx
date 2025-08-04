import React, {createContext, useContext, useState, useEffect} from 'react';
import type {ReactNode} from 'react';
import type {User, AuthContextType, SignupData, AuthResponse} from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps{
    children: ReactNode;
}

//TODO: TEST DATA PERSISTENCE!!

// Storage utility functions for easy switching between storage types
const StorageUtils = {
    getItem: (key: string): string | null => {
        return sessionStorage.getItem(key);
    },
    setItem: (key: string, value: string): void => {
        sessionStorage.setItem(key, value);
    },
    removeItem: (key: string): void => {
        sessionStorage.removeItem(key);
    },
    clear: (): void => {
        sessionStorage.clear();
    }
};

export const AuthProvider: React.FC<AuthProviderProps> =({children}) =>{
    const [user,setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(StorageUtils.getItem('token'));
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() =>{
        if (token){
            verifyToken();
        } else{
            setLoading(false);
        }
    }, [token]);

    const verifyToken = async (): Promise<void> => {
        try{
            const userId = StorageUtils.getItem('userId'); //get stored user id
            if (!userId){
                logout();
                return;
            }
            const response = await fetch(`api/users/{$userId}`,{ //must have route to get current user, it uses the user id to verify tokens
                headers:{
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok){
                const userData: User = await response.json();
                setUser(userData);
            } else{
                logout();
            }
        } catch (error){
            console.error('Token verification failed:', error);
            logout();
        } finally{
            setLoading(false);
        }
    };
    const login = async (email: string, password: string): Promise<Response> => {
        const response = await fetch('api/users/login',{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password})
        });

        if (response.ok){
            const data: AuthResponse = await response.json();
            setToken(data.token);
            setUser(data.user);
            StorageUtils.setItem('token', data.token);
            StorageUtils.setItem('userId', data.user.id); // store user id
        }
        return response;
    };
    const signup = async (userData:SignupData): Promise<Response> =>{
        const response = await fetch('api/users',{
            method: 'POST',
            headers:{'Content-Type': 'application/json'},
            body: JSON.stringify(userData)
        });
        if (response.ok){
            const data: AuthResponse = await response.json();
            setToken(data.token);
            setUser(data.user);
            StorageUtils.setItem('token', data.token);
            StorageUtils.setItem('userId', data.user.id);
        }
        return response;
    };

    const logout = (): void =>{
        setToken(null);
        setUser(null);
        StorageUtils.removeItem('token');
        StorageUtils.removeItem('userId');  //clear user ID
    };

    const value: AuthContextType = {
        user,
        token,
        loading,
        login,
        signup,
        logout
    };
    return(
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType =>{
    const context = useContext(AuthContext);
    if (!context){
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
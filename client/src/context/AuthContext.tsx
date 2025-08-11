import React, {createContext, useContext, useState, useEffect} from 'react';
import type {ReactNode} from 'react';
import type {User, AuthContextType, SignupData, AuthResponse} from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps{
    children: ReactNode;
}


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

    useEffect(() => {
        if (token) {
            console.log("token", token);
            verifyToken();
            const interval = setInterval(verifyToken, 60000); // Check every minute
            return () => clearInterval(interval);
        }
    }, [token]);


    const verifyToken = async (): Promise<void> => {
        try{
            const userId = StorageUtils.getItem('userId'); //get stored user id
            const token = StorageUtils.getItem('token');
            console.log("userId",userId)
            console.log("token", token)
            console.log(new Date().toString())
            if (!userId || !token){
                logout();
                return;
                
            }

            const response = await fetch(`/api/users/${userId}`,{ //must have route to get current user, it uses the user id to verify tokens
                headers:{
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok){
                console.log("pass token check");
                const userData: User = await response.json();
                setUser(userData);
            } else{
                logout();
                alert('Your session has expired. Please log in again.');
            }
        } catch (error){
            console.error('Token verification failed:', error);
            logout();
        } 
    };
    const login = async (email: string, password: string) => {
        try{
            const response = await fetch('api/users/login',{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password})
            
        });

        if (response.ok){
            console.log("check")
            const respJson = await response.json()
            console.log(respJson)
            StorageUtils.clear(); // clear all current data
            StorageUtils.setItem('token', respJson.token);
            StorageUtils.setItem('userId', respJson.user.id); // store user id
            StorageUtils.setItem('emailAddress', respJson.user.email);
            StorageUtils.setItem('phoneNumber', respJson.user.phone_num);
            StorageUtils.setItem('firstName', respJson.user.first_name);
            StorageUtils.setItem('lastName', respJson.user.last_name);
            StorageUtils.setItem('salutation', respJson.user.salutations);
            setToken(respJson.token);
            setUser(respJson.user);
        }
        return response;

        } catch (error){
            console.log(error)
        }
        
        
    };
    const signup = async (userData:SignupData): Promise<Response> =>{
        const response = await fetch('api/users',{
            method: 'POST',
            headers:{'Content-Type': 'application/json'},
            body: JSON.stringify(userData)
        });

        
        
        console.log(response);
        if (response.ok){
            const data: AuthResponse = await response.json();
            
            
            setToken(data.token);
            setUser(data.user);
            StorageUtils.clear();
            StorageUtils.setItem('token', data.token);
            StorageUtils.setItem('userId', data.user.id);
            StorageUtils.setItem('emailAddress', userData.email);
            StorageUtils.setItem('phoneNumber', userData.phone_num);
            StorageUtils.setItem('firstName', userData.first_name);
            StorageUtils.setItem('lastName', userData.last_name);
            StorageUtils.setItem('salutation', userData.salutation);
        }

        return response; // don't read json yet if error given
    };

    const logout = (): void =>{
        setToken(null);
        setUser(null);
        StorageUtils.clear();

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
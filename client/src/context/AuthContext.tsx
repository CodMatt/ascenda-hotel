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
            //console.log("token", token);
            verifyToken();
            const interval = setInterval(verifyToken, 60000); // Check every minute
            return () => clearInterval(interval);
        }
    }, [token]);

    const verifyToken = async (): Promise<void> => {
        try{
            const userId = StorageUtils.getItem('userId'); //get stored user id
            const token = StorageUtils.getItem('token');
            //console.log("userId",userId)
            //console.log("token", token)
            //console.log(new Date().toString())
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
                //console.log("pass token check");
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
            //console.log("hello there"+ JSON.stringify(response))
            if (response.ok){
                //console.log("check")
                const respJson = await response.json()
                //console.log("resp.json"+respJson)
                
                let token, user;
                
                if (respJson.user && respJson.token) {
                    // Format 1: Wrapped format like signup API
                    token = respJson.token;
                    user = respJson.user;
                    //console.log("Using wrapped format - token:", token, "user:", user);
                 
                
                    StorageUtils.clear(); // clear all current data
                    StorageUtils.setItem('token', token);
                    StorageUtils.setItem('userId', user.id);
                    StorageUtils.setItem('emailAddress', user.email);
                    StorageUtils.setItem('phoneNumber', user.phone_num);
                    StorageUtils.setItem('firstName', user.first_name);
                    StorageUtils.setItem('lastName', user.last_name);
                    StorageUtils.setItem('salutation', user.salutations);
                    setToken(token);
                    setUser(user);
                } else {
                    return response;
                }
            }
            return response;

        } catch (error){
            console.log(error)
        }
    };
    
    const signup = async (userData: SignupData): Promise<Response> => {
        try {
            const response = await fetch('api/users', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                return response;
            }

            const data = await response.json();
            
            // Auto-login after signup
            const loginResponse = await login(userData.email, userData.password);
            //console.log("loginresponse: " + JSON.stringify(loginResponse))
            if (loginResponse ==  undefined || !loginResponse.ok) {
                throw new Error('Auto-login failed after signup');
            }

            return response;
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
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
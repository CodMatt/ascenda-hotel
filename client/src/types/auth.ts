export interface User{
    id: string;
    username: string;
    email: string;
    phone_num: string;
    first_name: string;
    last_name: string;
    salutation: string;
    created: string;
}

export interface LoginCredentials{
    email: string;
    password: string;
}

export interface SignupData{
    username?: string;
    email: string;
    password: string;
    phone_num: string;
    first_name: string;
    last_name: string;
    salutation: string;
}

export interface AuthResponse{
    token: string;
    user:User;
}

export interface AuthContextType{
    user: User | null;
    token: string| null;
    loading: boolean;
    login: (email: string, password: string) => Promise<Response>;
    signup: (userData: SignupData) => Promise<Response>;
    logout: () => void;
}
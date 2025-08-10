import React, {useState} from 'react';
import type {FormEvent} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import type { LoginCredentials } from '../types/auth';

import LoginSuccess from "./notifications/LoginSuccess";

import "../styles/LoginPage.css";

const LoginForm: React.FC = () =>{
    const {login} = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<LoginCredentials>({
        email: '',
        password:''
    });

    // For errors while logging in
    const [error, setError] = useState<string>('');

    // To debounce
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    // For success in logging in 
    const [success, setSuccess] = useState(false);
    
    
    const handleSubmit = async(e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        

        try{
            setError('');
            setIsLoading(true);
            const response = await login(formData.email, formData.password);
            //console.log(response);
            
            if (response.ok){

                setSuccess(true);
                setTimeout(() => {
                    navigate(-1);
                    }, 2000)
            } else{
                const respJson = await response.json()
                console.log(respJson.error)
                if (!respJson || !respJson.error){ // Other reasons for failure
                    setError('Login failed');
                } else if (respJson.error == "No account with that email exists"){
                    setError("No account with that email exists.");
                } else if (respJson.error == "Invalid username/password"){
                    setError("Wrong password.");
                } else {
                    setError('Login failed');
                }
            }
        } catch (err){
            console.log(err)
            setError('Network error occurred');
            } 
        
        setIsLoading(false);
        
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void =>{
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    return (
        <form className="signin-form" onSubmit={handleSubmit}>
            {error && <div className='error'>{error}</div>}

            <input
               type='email'
               name='email'
               placeholder='Email'
               value={formData.email}
               onChange={handleInputChange}
               required
               disabled={isLoading || success} 
            />
            <input
                type='password'
                name='password'
                placeholder='Password'
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading || success}
            />

            {success && <LoginSuccess/>}

            <button type="submit" disabled={isLoading || success}>
                {isLoading || success? 'Logging in...': 'Login'}
            </button>

            {/* ← Back button */}
            <button
                type="button"
                className="back-button"
                onClick={() => navigate(-1)}
                disabled={isLoading || success}
                >
                ← Back
            </button>
        </form>
    );
};

export default LoginForm;



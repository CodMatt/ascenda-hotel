import React, {useState} from 'react';
import type {FormEvent} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import type { LoginCredentials } from '../types/auth';

import LoginSuccess from "./notifications/LoginSuccess";



import "../styles/LoginPage.css";

const LoginForm: React.FC = () =>{
    const {login} = useAuth();
    const [formData, setFormData] = useState<LoginCredentials>({
        email: '',
        password:''
    });
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const [success, setSuccess] = useState(false);

    const handleSubmit = async(e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try{
            const response = await login(formData.email, formData.password);
            //console.log(response);
            
            if (response.ok){

                setSuccess(true);
                setTimeout(() => {
                    navigate(-1);
                    }, 2000)
            } else{
                const respJson = await response.json()
                if (respJson.error == "Invalid credentials"){
                    setError(respJson.error);
                } else{
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
               disabled={isLoading} 
            />
            <input
                type='password'
                name='password'
                placeholder='Password'
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
            />

            {success && <LoginSuccess/>}

            <button type="submit" disabled={isLoading}>
                {isLoading? 'Logging in...': 'Login'}
            </button>
        </form>
    );
};

export default LoginForm;



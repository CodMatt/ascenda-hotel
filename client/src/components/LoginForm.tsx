import React, {useState} from 'react';
import type {FormEvent} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import type { LoginCredentials } from '../types/auth';
import "../styles/LoginPage.css";
import isEmailValid from '../lib/IsEmailValid';

const LoginForm: React.FC = () =>{
    const {login} = useAuth();
    const [formData, setFormData] = useState<LoginCredentials>({
        email: '',
        password:''
    });
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleSubmit = async(e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!isEmailValid(formData.email)) {
          setError("Please enter a valid email.");
          setIsLoading(false);
          return;
        }

        try{
            const response = await login(formData.email, formData.password);

            if (response.ok){
                navigate('/dashboard');
            } else{
                const errorData = await response.json();
                setError(errorData.message || 'Login failed');
            }
        } catch (err){
            setError('Network error occurred');
        } finally{ 
            setIsLoading(false);
        }
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
               onBlur={() => {
                if (!isEmailValid(formData.email)) {
                  setError("Invalid email format");
                }
                }}
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
            <button type="submit" disabled={isLoading}>
                {isLoading? 'Logging in...': 'Login'}
            </button>
        </form>
    );
};

export default LoginForm;



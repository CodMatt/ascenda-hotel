import React, {useState} from 'react';
import type {FormEvent} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import type {SignupData} from '../types/auth';

const SignupForm: React.FC = () => {
    const {signup} = useAuth();
    const [formData, setFormData] = useState<SignupData>({
        username:'',
        email:'',
        password:'',
        phone_num:'',
        first_name:'',
        last_name:'',
        salutation:''
    });
    const [error,setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> =>{
        e.preventDefault();
        setError('');
        setIsLoading(true);


        try{
            const response = await signup(formData);

            if (response.ok){
                navigate('/dashboard');
            } else{
                const errorData = await response.json();
                setError(errorData.message || 'Signup failed');
            }
        } catch (err){
            setError('Network error occured');
        } finally{
            setIsLoading(false);
        }

    };

    const handleInputChange = (e : React.ChangeEvent<HTMLInputElement>): void => {
        const {name, value} = e.target;
        setFormData(prev =>({
            ...prev,
            [name]: value
        }));
    };

    return(
        <form onSubmit={handleSubmit}>
            {error && <div className="error">{error}</div>}

            <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
                required
                disabled={isLoading}
            />

            <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
            />
            <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
            />
            <input
                type="tel"
                name="phone_num"
                placeholder="Phone Number"
                value={formData.phone_num}
                onChange={handleInputChange}
                required
                disabled={isLoading}
            />
            /* Optional fields */
            <input
                type="text"
                name="first_name"
                placeholder = "First Name (Optional)"
                value={formData.first_name}
                onChange={handleInputChange}
                disabled={isLoading}
            />
            <input
                type="text"
                name="last_name"
                placeholder = 'Last Name (Optional)'
                value={formData.last_name}
                onChange={handleInputChange}
                disabled={isLoading}
            />

            <input
                type='text'
                name='salutation'
                placeholder='Salutation (Optional)'
                value={formData.salutation}
                onChange={handleInputChange}
                disabled={isLoading}
            />
            <button type="submit" disabled={isLoading}>
                {isLoading? 'Creating Account...': 'Sign Up'}
            </button>
        </form>
    );
};

export default SignupForm;
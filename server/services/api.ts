import axios, { AxiosInstance, AxiosError } from 'axios';


const BASE_URL = process.env.API || 'http://localhost:5252/api';

class APIService{
    private api: AxiosInstance;

    constructor(){
            this.api = axios.create({
                baseURL: BASE_URL,
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            this.api.interceptors.request.use((config)=>{
                const token = localStorage.getItem('authToken');
            if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
        );

        // Response interceptor for error handling
        this.api.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                if (error.response?.status === 401) {
                localStorage.removeItem('authToken');
                window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );
    }

    

    public get instance() {
        return this.api;
    }
}


export const apiService = new APIService();
export default apiService.instance;


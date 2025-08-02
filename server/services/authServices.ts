import api from './api'
import { ILoginRequest, IRegisterRequest, IAuthResponse, IUser } from '../types/auth.types';

export class AuthService {
  async login(credentials: ILoginRequest): Promise<IAuthResponse> {
    const response = await api.post<IAuthResponse>('/users/login', credentials);
    localStorage.setItem('authToken', response.data.token);
    return response.data;
  }

  async register(userData: IRegisterRequest): Promise<IAuthResponse> {
    const response = await api.post<IAuthResponse>('/users', userData);
    localStorage.setItem('authToken', response.data.token);
    return response.data;
  }

  async getCurrentUser(): Promise<IUser> {
    const response = await api.get<IUser>('/users/me');
    return response.data;
  }

  logout(): void {
    localStorage.removeItem('authToken');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}

export const authService = new AuthService();